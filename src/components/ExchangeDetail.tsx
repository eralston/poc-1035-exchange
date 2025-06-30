import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { StatusBadge } from './StatusBadge';
import { PolicyCard } from './PolicyCard';
import { AuditLogEntry } from './AuditLogEntry';
import { ProgressIndicator } from './ProgressIndicator';
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
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Send,
  Download,
  Eye,
  Plus,
  Settings,
  Activity,
  Shield,
  Star,
  Zap
} from 'lucide-react';
import { 
  getDropTicketById,
  getAccountsByDropTicketId,
  getRelationsByDropTicketId,
  getCommunicationsByDropTicketId,
  getAuditLogsByDropTicketId,
  getCarrierById,
  getPartyById,
  updateDropTicketStatus,
  updateAccountStatus,
  createCarrierCommunication
} from '../services/api';
import { 
  DropTicket, 
  Account, 
  Relation, 
  CarrierCommunication, 
  AuditLog,
  Carrier,
  Party
} from '../types';
import { formatCurrency, formatDateTime, formatTimeAgo, formatName, formatPhone } from '../utils';
import { useLiveData } from '../hooks/useRealtime';

interface ExchangeDetailProps {
  exchangeId: string;
  onNavigate?: (page: string, data?: any) => void;
}

export const ExchangeDetail: React.FC<ExchangeDetailProps> = ({ 
  exchangeId, 
  onNavigate 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'communications' | 'documents' | 'audit'>('overview');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [communicationContent, setCommunicationContent] = useState('');

  // Live data hooks
  const { data: dropTicket, loading } = useLiveData(
    () => getDropTicketById(exchangeId),
    [exchangeId],
    ['DropTicketSubmitted', 'ExchangeCompleted']
  );

  const { data: accounts } = useLiveData(
    () => getAccountsByDropTicketId(exchangeId),
    [exchangeId],
    ['AccountValidated', 'TransferConfirmed']
  );

  const { data: relations } = useLiveData(
    () => getRelationsByDropTicketId(exchangeId),
    [exchangeId],
    ['PartyRelationCreated']
  );

  const { data: communications } = useLiveData(
    () => getCommunicationsByDropTicketId(exchangeId),
    [exchangeId],
    ['CarrierRequestSent']
  );

  const { data: auditLogs } = useLiveData(
    () => getAuditLogsByDropTicketId(exchangeId),
    [exchangeId],
    ['*']
  );

  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [parties, setParties] = useState<Party[]>([]);

  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const [carriersData, partiesData] = await Promise.all([
          import('../services/api').then(api => api.getCarriers()),
          import('../services/api').then(api => api.getParties())
        ]);
        setCarriers(carriersData);
        setParties(partiesData);
      } catch (error) {
        console.error('Error loading reference data:', error);
      }
    };
    loadReferenceData();
  }, []);

  if (loading || !dropTicket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50/20 to-blue-50/10 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600">Loading exchange details...</p>
        </div>
      </div>
    );
  }

  const getCarrierById = (id: string) => carriers.find(c => c.id === id);
  const getPartyById = (id: string) => parties.find(p => p.id === id);
  
  const targetCarrier = getCarrierById(dropTicket.targetCarrierId);
  const createdByUser = getPartyById(dropTicket.createdBy);
  const assignedToUser = dropTicket.assignedTo ? getPartyById(dropTicket.assignedTo) : null;

  // Get parties by relation type
  const owner = relations?.find(r => r.relationType === 'owner');
  const insured = relations?.find(r => r.relationType === 'insured');
  const agent = relations?.find(r => r.relationType === 'agent');

  const ownerParty = owner ? getPartyById(owner.partyId) : null;
  const insuredParty = insured ? getPartyById(insured.partyId) : null;
  const agentParty = agent ? getPartyById(agent.partyId) : null;

  const sourceAccounts = accounts?.filter(acc => acc.isSourceAccount) || [];
  const targetAccount = accounts?.find(acc => !acc.isSourceAccount);

  const totalCurrentValue = sourceAccounts.reduce((sum, acc) => sum + (acc.currentValue || 0), 0);
  const totalSurrenderValue = sourceAccounts.reduce((sum, acc) => sum + (acc.surrenderValue || 0), 0);

  const progressSteps = [
    { 
      id: 'submitted', 
      title: 'Submitted', 
      status: dropTicket.status === 'submitted' ? 'current' : 
              ['validated', 'in_progress', 'completed'].includes(dropTicket.status) ? 'completed' : 'pending'
    },
    { 
      id: 'validated', 
      title: 'Validated', 
      status: dropTicket.status === 'validated' ? 'current' : 
              ['in_progress', 'completed'].includes(dropTicket.status) ? 'completed' : 'pending'
    },
    { 
      id: 'in_progress', 
      title: 'In Progress', 
      status: dropTicket.status === 'in_progress' ? 'current' : 
              dropTicket.status === 'completed' ? 'completed' : 'pending'
    },
    { 
      id: 'completed', 
      title: 'Completed', 
      status: dropTicket.status === 'completed' ? 'completed' : 'pending'
    }
  ];

  const handleStatusUpdate = async () => {
    if (!newStatus || !statusReason) return;

    try {
      await updateDropTicketStatus(
        exchangeId,
        newStatus as any,
        'current-user-id',
        statusReason
      );
      setShowStatusModal(false);
      setNewStatus('');
      setStatusReason('');
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleSendCommunication = async () => {
    if (!selectedAccount || !communicationContent) return;

    try {
      await createCarrierCommunication(
        exchangeId,
        selectedAccount.id,
        selectedAccount.carrierId,
        communicationContent,
        'current-user-id'
      );
      setShowCommunicationModal(false);
      setSelectedAccount(null);
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
                onClick={() => onNavigate?.('dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">
                    Exchange {dropTicket.ticketNumber}
                  </h1>
                  <p className="text-sm text-slate-600">
                    {dropTicket.targetProductType === 'life_insurance' ? 'Life Insurance' : 'Annuity'} Exchange
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <StatusBadge status={dropTicket.status} glow />
              <StatusBadge status={dropTicket.priority} type="priority" />
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => setShowStatusModal(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Update Status
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <ProgressIndicator 
            steps={progressSteps} 
            orientation="horizontal"
            className="max-w-2xl mx-auto"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'accounts', label: 'Accounts', icon: Building2 },
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
                    <p className="text-sm text-slate-600">Total Value</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {formatCurrency(totalCurrentValue)}
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
                      {formatCurrency(totalSurrenderValue)}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Source Policies</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {sourceAccounts.length}
                    </p>
                  </div>
                  <FileText className="w-8 h-8 text-purple-500" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Days Active</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {Math.floor((Date.now() - dropTicket.submissionDate.getTime()) / (1000 * 60 * 60 * 24))}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-cyan-500" />
                </div>
              </Card>
            </div>

            {/* Exchange Details & Parties */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Exchange Information */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-slate-900">Exchange Information</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Submission Date</p>
                      <p className="font-medium">{formatDateTime(dropTicket.submissionDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Last Updated</p>
                      <p className="font-medium">{formatTimeAgo(dropTicket.updatedAt)}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-slate-600">Target Carrier</p>
                    <div className="flex items-center space-x-3 mt-1">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{targetCarrier?.name || 'Unknown Carrier'}</p>
                        <p className="text-sm text-slate-600">{targetCarrier?.code}</p>
                      </div>
                    </div>
                  </div>

                  {dropTicket.estimatedValue && (
                    <div>
                      <p className="text-sm text-slate-600">Estimated Value</p>
                      <p className="font-medium">{formatCurrency(dropTicket.estimatedValue)}</p>
                    </div>
                  )}

                  {dropTicket.notes && (
                    <div>
                      <p className="text-sm text-slate-600">Notes</p>
                      <p className="text-sm bg-slate-50 p-3 rounded-lg">{dropTicket.notes}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Created By</p>
                      <p className="font-medium">
                        {createdByUser ? formatName(createdByUser.firstName, createdByUser.lastName) : 'Unknown'}
                      </p>
                    </div>
                    {assignedToUser && (
                      <div>
                        <p className="text-sm text-slate-600">Assigned To</p>
                        <p className="font-medium">
                          {formatName(assignedToUser.firstName, assignedToUser.lastName)}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Parties Involved */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-slate-900">Parties Involved</h3>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Owner */}
                  {ownerParty && (
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-slate-900">
                            {formatName(ownerParty.firstName, ownerParty.lastName)}
                          </p>
                          <Badge variant="info" size="sm">Owner</Badge>
                        </div>
                        {ownerParty.email && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span className="text-sm text-slate-600">{ownerParty.email}</span>
                          </div>
                        )}
                        {ownerParty.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span className="text-sm text-slate-600">{formatPhone(ownerParty.phone)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Insured */}
                  {insuredParty && (
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-slate-900">
                            {formatName(insuredParty.firstName, insuredParty.lastName)}
                          </p>
                          <Badge variant="success" size="sm">Insured</Badge>
                        </div>
                        {insured?.relationshipToOwner && (
                          <p className="text-sm text-slate-600 capitalize">
                            {insured.relationshipToOwner} of owner
                          </p>
                        )}
                        {insuredParty.dateOfBirth && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span className="text-sm text-slate-600">
                              Born {formatDateTime(insuredParty.dateOfBirth)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Agent */}
                  {agentParty && (
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Star className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-slate-900">
                            {formatName(agentParty.firstName, agentParty.lastName)}
                          </p>
                          <Badge variant="purple" size="sm">Agent</Badge>
                        </div>
                        {agentParty.agencyName && (
                          <p className="text-sm text-slate-600">{agentParty.agencyName}</p>
                        )}
                        {agentParty.licenseNumber && (
                          <p className="text-sm text-slate-600">License: {agentParty.licenseNumber}</p>
                        )}
                        {agentParty.email && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span className="text-sm text-slate-600">{agentParty.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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

        {/* Accounts Tab */}
        {activeTab === 'accounts' && (
          <div className="space-y-8">
            {/* Source Accounts */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Source Accounts</h2>
                <Badge variant="info" size="lg">
                  {sourceAccounts.length} {sourceAccounts.length === 1 ? 'Policy' : 'Policies'}
                </Badge>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sourceAccounts.map(account => (
                  <PolicyCard
                    key={account.id}
                    account={account}
                    carrier={getCarrierById(account.carrierId)}
                    onClick={() => {
                      setSelectedAccount(account);
                      setShowCommunicationModal(true);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Target Account */}
            {targetAccount && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Target Account</h2>
                <div className="max-w-md">
                  <PolicyCard
                    account={targetAccount}
                    carrier={getCarrierById(targetAccount.carrierId)}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Communications Tab */}
        {activeTab === 'communications' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Carrier Communications</h2>
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
                  emptyMessage="No communications found"
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Documents</h2>
              <Button variant="primary" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </div>

            <Card className="p-8 text-center">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Documents Yet</h3>
              <p className="text-slate-600 mb-4">
                Documents related to this exchange will appear here
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
            <h2 className="text-2xl font-bold text-slate-900">Audit Trail</h2>
            
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
        title="Update Exchange Status"
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="New Status"
            options={[
              { value: 'submitted', label: 'Submitted' },
              { value: 'validated', label: 'Validated' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' }
            ]}
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            placeholder="Select new status"
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Reason for Change
            </label>
            <textarea
              rows={3}
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Explain why you're changing the status..."
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
              disabled={!newStatus || !statusReason}
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
          {!selectedAccount && (
            <Select
              label="Select Account"
              options={sourceAccounts.map(acc => ({
                value: acc.id,
                label: `${acc.accountNumber} - ${getCarrierById(acc.carrierId)?.name}`
              }))}
              value={selectedAccount?.id || ''}
              onChange={(e) => {
                const account = sourceAccounts.find(acc => acc.id === e.target.value);
                setSelectedAccount(account || null);
              }}
              placeholder="Select account to communicate about"
            />
          )}

          {selectedAccount && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-medium text-blue-900">
                {selectedAccount.accountNumber} - {getCarrierById(selectedAccount.carrierId)?.name}
              </p>
              <p className="text-sm text-blue-700">
                Communication will be sent via {getCarrierById(selectedAccount.carrierId)?.preferredCommunicationMethod}
              </p>
            </div>
          )}

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
              disabled={!selectedAccount || !communicationContent}
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