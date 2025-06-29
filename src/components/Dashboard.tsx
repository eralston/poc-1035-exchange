import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { StatusBadge } from './StatusBadge';
import { PolicyCard } from './PolicyCard';
import { AuditLogEntry } from './AuditLogEntry';
import { ProgressIndicator } from './ProgressIndicator';
import { Table } from './ui/Table';
import { 
  Plus, 
  Search, 
  Filter, 
  Bell, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Users,
  FileText,
  Activity,
  DollarSign,
  Calendar,
  ArrowRight,
  Eye,
  MessageSquare,
  Download
} from 'lucide-react';
import { 
  getDropTickets, 
  getAccounts, 
  getAuditLogs, 
  getCommunications,
  getAnalytics,
  getCarriers,
  getParties
} from '../services/api';
import { 
  DropTicket, 
  Account, 
  AuditLog, 
  CarrierCommunication,
  Carrier,
  Party
} from '../types';
import { formatCurrency, formatDateTime, formatTimeAgo } from '../utils';

interface DashboardProps {
  onNavigate?: (page: string, data?: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [dropTickets, setDropTickets] = useState<DropTicket[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [communications, setCommunications] = useState<CarrierCommunication[]>([]);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'exchanges' | 'activity'>('overview');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          ticketsData,
          accountsData,
          auditData,
          commsData,
          carriersData,
          partiesData,
          analyticsData
        ] = await Promise.all([
          getDropTickets(),
          getAccounts(),
          getAuditLogs(),
          getCommunications(),
          getCarriers(),
          getParties(),
          getAnalytics()
        ]);

        setDropTickets(ticketsData);
        setAccounts(accountsData);
        setAuditLogs(auditData.slice(0, 10)); // Recent 10 entries
        setCommunications(commsData);
        setCarriers(carriersData);
        setParties(partiesData);
        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getCarrierById = (id: string) => carriers.find(c => c.id === id);
  const getPartyById = (id: string) => parties.find(p => p.id === id);

  const recentDropTickets = dropTickets.slice(0, 5);
  const urgentTickets = dropTickets.filter(dt => dt.priority === 'urgent' || dt.priority === 'high');
  const overdueComms = communications.filter(comm => 
    comm.slaDeadline && new Date(comm.slaDeadline) < new Date() && comm.status !== 'responded'
  );

  const progressSteps = [
    { id: 'submitted', title: 'Submitted', status: 'completed' as const },
    { id: 'validated', title: 'Validated', status: 'completed' as const },
    { id: 'in_progress', title: 'In Progress', status: 'current' as const },
    { id: 'completed', title: 'Completed', status: 'pending' as const }
  ];

  const exchangeColumns = [
    {
      key: 'ticketNumber',
      header: 'Ticket #',
      render: (value: string) => (
        <span className="font-mono text-sm font-medium text-blue-600">{value}</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => <StatusBadge status={value} />
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (value: string) => <StatusBadge status={value} type="priority" />
    },
    {
      key: 'targetProductType',
      header: 'Target Type',
      render: (value: string) => (
        <Badge variant="info" size="sm">
          {value === 'life_insurance' ? 'Life Insurance' : 'Annuity'}
        </Badge>
      )
    },
    {
      key: 'estimatedValue',
      header: 'Est. Value',
      render: (value: number) => value ? formatCurrency(value) : 'N/A'
    },
    {
      key: 'submissionDate',
      header: 'Submitted',
      render: (value: Date) => formatTimeAgo(value)
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (value: any, row: DropTicket) => (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onNavigate?.('exchange-detail', { id: row.id })}
        >
          <Eye className="w-4 h-4" />
        </Button>
      )
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-slate-900">ExchangeFlow Dashboard</h1>
              <Badge variant="success" size="sm">Live</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="w-5 h-5" />
                {(urgentTickets.length + overdueComms.length) > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {urgentTickets.length + overdueComms.length}
                  </span>
                )}
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => onNavigate?.('create-exchange')}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Exchange
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'exchanges', label: 'Exchanges', icon: FileText },
            { id: 'activity', label: 'Activity', icon: Activity }
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Exchanges</p>
                    <p className="text-3xl font-bold text-slate-900">{analytics?.summary.totalExchanges || 0}</p>
                    <p className="text-sm text-emerald-600">+12% this month</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Avg Cycle Time</p>
                    <p className="text-3xl font-bold text-slate-900">{analytics?.summary.averageCycleTime || 0}h</p>
                    <p className="text-sm text-emerald-600">-8% improvement</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">SLA Compliance</p>
                    <p className="text-3xl font-bold text-slate-900">{analytics?.summary.slaComplianceRate || 0}%</p>
                    <p className="text-sm text-emerald-600">Above target</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Value</p>
                    <p className="text-3xl font-bold text-slate-900">{formatCurrency(analytics?.summary.totalValue || 0)}</p>
                    <p className="text-sm text-emerald-600">+24% this quarter</p>
                  </div>
                  <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-cyan-600" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Alerts & Quick Actions */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Urgent Items */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">Urgent Items</h3>
                    <Badge variant="error" size="sm">{urgentTickets.length + overdueComms.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {urgentTickets.slice(0, 3).map(ticket => (
                    <div key={ticket.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div>
                        <p className="font-medium text-red-900">{ticket.ticketNumber}</p>
                        <p className="text-sm text-red-700">Priority: {ticket.priority}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => onNavigate?.('exchange-detail', { id: ticket.id })}>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {overdueComms.slice(0, 2).map(comm => (
                    <div key={comm.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div>
                        <p className="font-medium text-amber-900">SLA Breach</p>
                        <p className="text-sm text-amber-700">{getCarrierById(comm.carrierId)?.name}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {auditLogs.slice(0, 5).map(log => (
                    <AuditLogEntry 
                      key={log.id} 
                      auditLog={log} 
                      user={log.userId ? getPartyById(log.userId) : undefined}
                    />
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="primary" 
                    className="w-full justify-start"
                    onClick={() => onNavigate?.('create-exchange')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Start New Exchange
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="w-full justify-start"
                    onClick={() => onNavigate?.('reports')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="w-full justify-start"
                    onClick={() => onNavigate?.('carriers')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Manage Carriers
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="w-full justify-start"
                    onClick={() => onNavigate?.('analytics')}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Exchanges */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Recent Exchanges</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setActiveTab('exchanges')}
                  >
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentDropTickets.map(ticket => (
                    <div key={ticket.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                         onClick={() => onNavigate?.('exchange-detail', { id: ticket.id })}>
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{ticket.ticketNumber}</p>
                          <p className="text-sm text-slate-600">
                            {ticket.targetProductType === 'life_insurance' ? 'Life Insurance' : 'Annuity'} • 
                            {ticket.estimatedValue ? formatCurrency(ticket.estimatedValue) : 'Value TBD'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <StatusBadge status={ticket.status} />
                        <ProgressIndicator 
                          steps={progressSteps} 
                          orientation="horizontal"
                          className="w-32"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Exchanges Tab */}
        {activeTab === 'exchanges' && (
          <div className="space-y-6">
            {/* Filters */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search exchanges..."
                      className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <Button variant="secondary" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => onNavigate?.('create-exchange')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Exchange
                </Button>
              </div>
            </Card>

            {/* Exchanges Table */}
            <Card>
              <CardContent className="p-0">
                <Table
                  data={dropTickets}
                  columns={exchangeColumns}
                  emptyMessage="No exchanges found"
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-slate-900">System Activity</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditLogs.map(log => (
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
    </div>
  );
};