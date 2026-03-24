'use client';

import { useEffect, useState } from 'react';
import { Shield, Activity, CheckCircle, TrendingUp, Users } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function Dashboard() {
  const [overview, setOverview] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [overviewRes, agentsRes, jobsRes] = await Promise.all([
        axios.get(`${API_URL}/api/analytics/overview`),
        axios.get(`${API_URL}/api/agents`),
        axios.get(`${API_URL}/api/jobs`),
      ]);

      setOverview(overviewRes.data.data);
      setAgents(agentsRes.data.data);
      setJobs(jobsRes.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">SentinelNet</h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">System Active</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="h-6 w-6" />}
            label="Active Agents"
            value={overview?.activeAgents || 0}
            subtitle={`${overview?.totalAgents || 0} total`}
            color="blue"
          />
          <StatCard
            icon={<Activity className="h-6 w-6" />}
            label="Total Jobs"
            value={overview?.totalJobs || 0}
            subtitle={`${overview?.completedJobs || 0} completed`}
            color="green"
          />
          <StatCard
            icon={<TrendingUp className="h-6 w-6" />}
            label="Avg Risk Score"
            value={overview?.averageRiskScore || 0}
            subtitle="out of 100"
            color="purple"
          />
          <StatCard
            icon={<CheckCircle className="h-6 w-6" />}
            label="Value Scanned"
            value={overview?.totalValueScanned || '0 ETH'}
            subtitle="Total verified"
            color="orange"
          />
        </div>

        {/* Agents Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Verification Agents</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <AgentCard key={agent.address} agent={agent} />
            ))}
          </div>
        </section>

        {/* Recent Jobs */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Verification Jobs</h2>
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Token Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risk Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budget
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{job.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {job.tokenAddress.slice(0, 10)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {job.riskScore ? (
                          <RiskScoreBadge score={job.riskScore} />
                        ) : (
                          <span className="text-sm text-gray-400">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.totalBudget} ETH
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, subtitle, color }: any) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

function AgentCard({ agent }: { agent: any }) {
  const successRate = ((agent.successfulJobs / agent.totalJobs) * 100).toFixed(1);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{agent.name}</h3>
          <p className="text-sm text-gray-500">{agent.type}</p>
        </div>
        {agent.isActive && (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
            Active
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Reputation</span>
            <span className="font-medium">{(agent.reputationScore / 100).toFixed(2)}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full"
              style={{ width: `${agent.reputationScore / 100}%` }}
            ></div>
          </div>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Success Rate</span>
          <span className="font-medium text-green-600">{successRate}%</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Jobs Completed</span>
          <span className="font-medium">{agent.totalJobs}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Price</span>
          <span className="font-medium">{agent.pricePerVerification} ETH</span>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    completed: 'bg-green-100 text-green-800',
    in_progress: 'bg-blue-100 text-blue-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

function RiskScoreBadge({ score }: { score: number }) {
  let color = 'bg-red-100 text-red-800';
  if (score >= 80) color = 'bg-green-100 text-green-800';
  else if (score >= 60) color = 'bg-yellow-100 text-yellow-800';

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${color}`}>
      {score}/100
    </span>
  );
}
