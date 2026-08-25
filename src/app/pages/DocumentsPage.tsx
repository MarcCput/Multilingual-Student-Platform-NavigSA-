import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Upload,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Eye,
  Trash2,
  Search,
  Filter,
  FolderOpen,
  Shield
} from 'lucide-react';

export const DocumentsPage = () => {
  const { t } = useLanguage();
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const documents = [
    {
      id: 1,
      name: 'Passport Copy',
      type: 'Identity',
      size: '2.4 MB',
      uploadedDate: '2026-05-10',
      status: 'verified',
      university: 'All Applications',
    },
    {
      id: 2,
      name: 'Academic Transcripts - Grade 12',
      type: 'Academic',
      size: '1.8 MB',
      uploadedDate: '2026-05-08',
      status: 'verified',
      university: 'University of Cape Town',
    },
    {
      id: 3,
      name: 'English Proficiency Certificate',
      type: 'Language',
      size: '856 KB',
      uploadedDate: '2026-05-05',
      status: 'pending',
      university: 'University of Cape Town',
    },
    {
      id: 4,
      name: 'Proof of Residence',
      type: 'Identity',
      size: '1.2 MB',
      uploadedDate: '2026-05-03',
      status: 'verified',
      university: 'All Applications',
    },
    {
      id: 5,
      name: 'Motivation Letter - Computer Science',
      type: 'Application',
      size: '245 KB',
      uploadedDate: '2026-05-01',
      status: 'verified',
      university: 'University of Cape Town',
    },
    {
      id: 6,
      name: 'Reference Letter - Mathematics Teacher',
      type: 'Application',
      size: '312 KB',
      uploadedDate: '2026-04-28',
      status: 'rejected',
      university: 'Stellenbosch University',
      rejectionReason: 'Document quality too low, please re-upload',
    },
    {
      id: 7,
      name: 'Birth Certificate',
      type: 'Identity',
      size: '1.5 MB',
      uploadedDate: '2026-04-25',
      status: 'verified',
      university: 'All Applications',
    },
    {
      id: 8,
      name: 'Financial Statement',
      type: 'Financial',
      size: '3.2 MB',
      uploadedDate: '2026-04-20',
      status: 'pending',
      university: 'University of Witwatersrand',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'pending':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'rejected':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const documentStats = {
    total: documents.length,
    verified: documents.filter((d) => d.status === 'verified').length,
    pending: documents.filter((d) => d.status === 'pending').length,
    rejected: documents.filter((d) => d.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('documents.title')}</h1>
            <p className="text-slate-600">Upload and manage your application documents</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/30">
            <Upload className="w-5 h-5" />
            <span className="hidden sm:inline">{t('documents.upload')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm">Total Documents</span>
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{documentStats.total}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm">Verified</span>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-700">{documentStats.verified}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm">Pending</span>
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-700">{documentStats.pending}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm">Needs Attention</span>
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-700">{documentStats.rejected}</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-dashed border-blue-300 rounded-2xl p-8 mb-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Upload Documents</h3>
            <p className="text-sm text-slate-600 mb-4">
              Drag and drop files here, or click to browse. Supported formats: PDF, JPG, PNG (Max 10MB)
            </p>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Choose Files
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search documents..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <button className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors">
                <Filter className="w-5 h-5" />
                <span>Filter</span>
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto">
              {['all', 'verified', 'pending', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    filterStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 mb-1 truncate">{doc.name}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                          <span className="bg-slate-100 px-2 py-0.5 rounded">{doc.type}</span>
                          <span>•</span>
                          <span>{doc.size}</span>
                          <span>•</span>
                          <span>{new Date(doc.uploadedDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 whitespace-nowrap ${getStatusColor(doc.status)}`}>
                        {getStatusIcon(doc.status)}
                        {t(`status.${doc.status}`)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                      <FolderOpen className="w-4 h-4" />
                      <span>{doc.university}</span>
                    </div>

                    {doc.status === 'rejected' && doc.rejectionReason && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                        <div className="flex items-start gap-2">
                          <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-xs font-medium text-red-900 mb-1">Rejection Reason</div>
                            <div className="text-sm text-red-700">{doc.rejectionReason}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-slate-200 mt-6">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No documents found</h3>
            <p className="text-slate-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};
