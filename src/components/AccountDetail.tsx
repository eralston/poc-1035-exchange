import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { StatusBadge } from './StatusBadge';
import { AuditLogEntry } from './AuditLogEntry';
import { Table } from './ui/Table';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { 
  ArrowLeft, 
  Edit, 
  MessageSquare, 
  FileText, 
  Clock, 
  DollarSign,
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Send,
  Eye,
  Plus,
  Shield,
  Activity,
  User,
  Phone,
  Mail,
  ExternalLink
} from 'lucide-react';
import { 
  getAccountById,
  getCommunicationsByAccountId,
  getDocumentsByAccountId,
  getAuditLogsByAccountId,
  getCarrierById,
  getPartyById,
  updateAccountStatus,
  createCarrierCommunication,
  getDropTicketById,
  getRelationsByDropTicketId
} from '../services/api';
import { 
  Account, 
  CarrierCommunication, 
  Document,
  AuditLog,
  Carrier,
  Party,
  DropTicket,
  Relation
} from '../types';
import { formatCurrency, formatDateTime, formatTimeAgo, formatName, formatPhone } from '../utils';
import { useLiveData } from '../hooks/useRealtime';

interface AccountDetailProps {
  accountId: string;
  onNavigate?: (page: string, data?: any) => void;
}

export const AccountDetail: React.FC<AccountDetailProps> = ({ 
  accountId, 
  onNavigate 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'communications' | 'documents' | 'audit'>('overview');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [validationNotes, setValidationNotes] = useState('');
  const [currentValue, setCurrentValue] = useState<number | undefined>();
  const [surrenderValue, setSurrenderValue] = useState<number | undefined>();
  const [communicationContent, setCommunicationContent] = useState('');

  // Live data hooks
  const { data: account, loading } = useLiveData(
    () => getAccountById(accountId),
    [accountId],
    ['AccountValidated', 'TransferConfirmed']
  );

  const { data: communications } = useLiveData(
    () => getCommunicationsByAccountId(accountId),
    [accountId],
    ['CarrierRequestSent']
  );

  const { data: documents } = useLiveData(
    () => getDocumentsByAccountId(accountId),
    [accountId]
  );

  const { data: auditLogs } = useLiveData(
    () => getAuditLogsByAccountId(accountId),
    [accountId],
    ['*']
  );

  const [dropTicket, setDropTicket] = useState<DropTicket | null>(null);
  const [relations, setRelations] = useState<Relation[]>([]);
  const [carrier, setCarrier] = useState<Carrier | null>(null);
  const [parties, setParties] = useState<Party[]>([]);

  useEffect(() => {
    const loadReferenceData = async () => {
      if (!account) return;

      try {
        const [dropTicketData, relationsData, carrierData, partiesData] = await Promise.all([
          getDropTicketById(account.dropTicketId),
          getRelationsByDropTicketId(account.dropTicketId),
          getCarrierById(account.carrierId),
          import('../services/api').then(api => api.getParties())
        ]);

        setDropTicket(dropTicketData);
        setRelations(relationsData);
        setCarrier(carrierData);
        setParties(partiesData);
      } catch (error) {
        console.error('Error loading reference data:', error);
      }
    };

    loadReferenceData();
  }, [account]);

  if (loading || !account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50/20 to-blue-50/10 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600">Loading account details...</p>
        </div>
      </div>
    );
  }

  const getPartyById = (id: string) => parties.find(p => p.id === id);
  
  // Get parties by relation type for this account's drop ticket
  const owner = relations.find(r => r.relationType === 'owner');
  const insured = relations.find(r => r.relationType === 'insured');
  const agent = relations.find(r => r.relationType === 'agent');

  const ownerParty = owner ? getPartyById(owner.partyId) : null;
  const insuredParty = insured ? getPartyById(insured.partyId) : null;
  const agentParty = agent ? getPartyById(agent.partyId) : null;

  const hasOutstandingLoans = (account.outstandingLoans || 0) > 0;
  const loanToValueRatio = account.surrenderValue && account.outstandingLoans 
    ? (account.outstandingLoans / account.surrenderValue) * 100 
    : 0;

  const handleStatusUpdate = async () => {
    if (!newStatus) return;

    try {
      await updateAccountStatus(
        {
          accountId: account.id,
          status: newStatus as any,
          validationNotes,
          currentValue,
          surrenderValue
        },
        'current-user-id'
      );
      setShowStatusModal(false);
      setNewStatus('');
      setStatusReason('');
      setValidationNotes('');
      setCurrentValue(undefined);
      setSurrenderValue(undefined);
    } catch (error) {
      console.error('Error updating account status:', error);
    }
  };

  const handleSendCommunication = async () => {
    if (!communicationContent) return;

    try {
      await createCarrierCommunication(
        account.dropTicketId,
        account.id,
        account.carrierId,
        communicationContent,
        'current-user-id'
      );
      setShowCommunicationModal(false);
      setCommunicationContent('');
    } catch (error) {
      console.error('Error sending communication:', error);
    }
  };

  const communicationColumns = [
    {
      key: 'createdAt',
      header: 'Date',
      render: (value: Date) => formatDateTime(value)
    },
    {
      key: 'communicationType',
      header: 'Type',
      render: (value: string) => (
        <Badge variant="info" size="sm">
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      )
    },
    {
      key: 'method',
      header: 'Method',
      render: (value: string) => value.toUpperCase()
    },
    {
      key: 'direction',
      header: 'Direction',
      render: (value: string) => (
        <Badge variant={value === 'outbound' ? 'info' : 'success'} size="sm">
          {value === 'outbound' ? 'Sent' : 'Received'}
        </Badge>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => <StatusBadge status={value} type="communication" />
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (value: any, row: CarrierCommunication) => (
        <Button variant="ghost" size="sm">
          <Eye className="w-4 h-4" />
        </Button>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50/20 to-blue-50/10">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onNavigate?.('exchange-detail', { id: account.dropTicketId })}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Exchange
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">
                    Account {account.accountNumber}
                  </h1>
                  <p className="text-sm text-slate-600">
                    {carrier?.name} • {account.accountType === 'life_insurance' ? 'Life Insurance' : 'Annuity'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <StatusBadge status={account.status} glow />
              <Badge variant={account.isSourceAccount ? 'info' : 'purple'} size="sm">
                {account.isSourceAccount ? 'Source' : 'Target'}
              </Badge>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => setShowStatusModal(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Update Status
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => setShowCommunicationModal(true)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Communication
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'communications', label: 'Communications', icon: MessageSquare },
            { id: 'documents', label: 'Documents', icon: FileText },
            { id: 'audit', label: 'Audit Trail', icon: Shield }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                ${activeTab === tab.id 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Current Value</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {account.currentValue ? formatCurrency(account.currentValue) : 'N/A'}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-500" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Surrender Value</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {account.surrenderValue ? formatCurrency(account.surrenderValue) : 'N/A'}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Outstanding Loans</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {account.outstandingLoans ? formatCurrency(account.outstandingLoans) : '$0'}
                    </p>
                  </div>
                  <AlertTriangle className={`w-8 h-8 ${hasOutstandingLoans ? 'text-amber-500' : 'text-slate-300'}`} />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Communications</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {communications?.length || 0}
                    </p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-purple-500" />
                </div>
              </Card>
            </div>

            {/* Account Details & Exchange Context */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Account Information */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-slate-900">Account Information</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Account Number</p>
                      <p className="font-mono font-medium">{account.accountNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Account Type</p>
                      <p className="font-medium capitalize">
                        {account.accountType.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-slate-600">Carrier</p>
                    <div className="flex items-center space-x-3 mt-1">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{carrier?.name || 'Unknown Carrier'}</p>
                        <p className="text-sm text-slate-600">{carrier?.code}</p>
                      </div>
                    </div>
                  </div>

                  {account.productName && (
                    <div>
                      <p className="text-sm text-slate-600">Product Name</p>
                      <p className="font-medium">{account.productName}</p>
                    </div>
                  )}

                  {account.issueDate && (
                    <div>
                      <p className="text-sm text-slate-600">Issue Date</p>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <p className="font-medium">{formatDateTime(account.issueDate)}</p>
                      </div>
                    </div>
                  )}

                  {hasOutstandingLoans && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <p className="font-medium text-amber-900">Outstanding Loans</p>
                      </div>
                      <p className="text-sm text-amber-800 mt-1">
                        Loan-to-value ratio: {loanToValueRatio.toFixed(1)}%
                      </p>
                      {loanToValueRatio > 90 && (
                        <p className="text-sm text-amber-800 font-medium">
                          ⚠️ High loan ratio may affect exchange eligibility
                        </p>
                      )}
                    </div>
                  )}

                  {account.validationNotes && (
                    <div>
                      <p className="text-sm text-slate-600">Validation Notes</p>
                      <p className="text-sm bg-slate-50 p-3 rounded-lg">{account.validationNotes}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Created</p>
                      <p className="font-medium">{formatDateTime(account.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Last Updated</p>
                      <p className="font-medium">{formatTimeAgo(account.updatedAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Exchange Context */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">Exchange Context</h3>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onNavigate?.('exchange-detail', { id: account.dropTicketId })}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Full Exchange
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dropTicket && (
                    <>
                      <div>
                        <p className="text-sm text-slate-600">Exchange Ticket</p>
                        <p className="font-mono font-medium">{dropTicket.ticketNumber}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-600">Exchange Status</p>
                          <StatusBadge status={dropTicket.status} />
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Priority</p>
                          <StatusBadge status={dropTicket.priority} type="priority" />
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-slate-600">Target Product</p>
                        <p className="font-medium capitalize">
                          {dropTicket.targetProductType.replace('_', ' ')}
                        </p>
                      </div>
                    </>
                  )}

                  {/* Related Parties */}
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600 font-medium">Related Parties</p>
                    
                    {ownerParty && (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-slate-900">
                              {formatName(ownerParty.firstName, ownerParty.lastName)}
                            </p>
                            <Badge variant="info" size="sm">Owner</Badge>
                          </div>
                          {ownerParty.email && (
                            <p className="text-sm text-slate-600">{ownerParty.email}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {insuredParty && insuredParty.id !== ownerParty?.id && (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-slate-900">
                              {formatName(insuredParty.firstName, insuredParty.lastName)}
                            </p>
                            <Badge variant="success" size="sm">Insured</Badge>
                          </div>
                        </div>
                      </div>
                    )}

                    {agentParty && (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-slate-900">
                              {formatName(agentParty.firstName, agentParty.lastName)}
                            </p>
                            <Badge variant="purple" size="sm">Agent</Badge>
                          </div>
                          {agentParty.agencyName && (
                            <p className="text-sm text-slate-600">{agentParty.agencyName}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditLogs?.slice(0, 5).map(log => (
                    <AuditLogEntry 
                      key={log.id} 
                      auditLog={log} 
                      user={log.userId ? getPartyById(log.userId) : undefined}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Communications Tab */}
        {activeTab === 'communications' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Account Communications</h2>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => setShowCommunicationModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Communication
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table
                  data={communications || []}
                  columns={communicationColumns}
                  emptyMessage="No communications found for this account"
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Account Documents</h2>
              <Button variant="primary" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </div>

            <Card className="p-8 text-center">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Documents Yet</h3>
              <p className="text-slate-600 mb-4">
                Documents specific to this account will appear here
              </p>
              <Button variant="secondary" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Upload First Document
              </Button>
            </Card>
          </div>
        )}

        {/* Audit Tab */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Account Audit Trail</h2>
            
            <Card>
              <CardContent>
                <div className="space-y-4">
                  {auditLogs?.map(log => (
                    <AuditLogEntry 
                      key={log.id} 
                      auditLog={log} 
                      user={log.userId ? getPartyById(log.userId) : undefined}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Account Status"
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="New Status"
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'validated', label: 'Validated' },
              { value: 'awaiting_carrier', label: 'Awaiting Carrier' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'transferred', label: 'Transferred' }
            ]}
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            placeholder="Select new status"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Current Value"
              type="number"
              value={currentValue || account.currentValue || ''}
              onChange={(e) => setCurrentValue(parseFloat(e.target.value) || undefined)}
              placeholder="Enter current value"
            />

            <Input
              label="Surrender Value"
              type="number"
              value={surrenderValue || account.surrenderValue || ''}
              onChange={(e) => setSurrenderValue(parseFloat(e.target.value) || undefined)}
              placeholder="Enter surrender value"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Validation Notes
            </label>
            <textarea
              rows={3}
              value={validationNotes}
              onChange={(e) => setValidationNotes(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add validation notes or comments..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button 
              variant="secondary" 
              onClick={() => setShowStatusModal(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleStatusUpdate}
              disabled={!newStatus}
            >
              Update Status
            </Button>
          </div>
        </div>
      </Modal>

      {/* Communication Modal */}
      <Modal
        isOpen={showCommunicationModal}
        onClose={() => setShowCommunicationModal(false)}
        title="Send Carrier Communication"
        size="lg"
      >
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="font-medium text-blue-900">
              {account.accountNumber} - {carrier?.name}
            </p>
            <p className="text-sm text-blue-700">
              Communication will be sent via {carrier?.preferredCommunicationMethod}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Message Content
            </label>
            <textarea
              rows={6}
              value={communicationContent}
              onChange={(e) => setCommunicationContent(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your message to the carrier..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button 
              variant="secondary" 
              onClick={() => setShowCommunicationModal(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSendCommunication}
              disabled={!communicationContent}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Communication
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};