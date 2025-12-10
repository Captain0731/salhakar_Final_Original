import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import ReactMarkdown from 'react-markdown';
import { 
  FileText, 
  Folder, 
  Plus, 
  Search, 
  MoreVertical,
  Edit,
  Trash2,
  FolderPlus,
  Calendar,
  Clock,
  Tag,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  X,
  Save,
  Eye,
  ArrowLeft
} from 'lucide-react';

const Notes = ({ onBack }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedReferenceType, setSelectedReferenceType] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [isFolderView, setIsFolderView] = useState(false); // Track if viewing a specific folder

  const [folders, setFolders] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  });

  // Note popup state
  const [showNotePopup, setShowNotePopup] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteContent, setNoteContent] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  
  // Selection state for multiple delete
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Delete confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteType, setDeleteType] = useState(null); // 'folder' or 'note' or 'multiple'
  const [deleteItem, setDeleteItem] = useState(null); // The item to delete (single) or array of items (multiple)
  const [deleting, setDeleting] = useState(false);

  // Load folders from API
  useEffect(() => {
    const loadFolders = async () => {
      if (!isAuthenticated) return;
      
      try {
        const response = await apiService.getFolders();
        let foldersData = [];
        if (response.success && response.data?.folders) {
          foldersData = response.data.folders;
        } else if (Array.isArray(response)) {
          foldersData = response;
        } else if (response.data && Array.isArray(response.data)) {
          foldersData = response.data;
        }
        setFolders(foldersData);
      } catch (error) {
        console.error('Error loading folders:', error);
        setFolders([]);
      }
    };

    loadFolders();
  }, [isAuthenticated]);

  // Load notes from API
  useEffect(() => {
    const loadNotes = async () => {
      if (!isAuthenticated) {
        setNotes([]);
        return;
      }

      try {
        setLoading(true);
        const params = {
          page: pagination.page,
          limit: pagination.limit
        };

        if (selectedFolder && selectedFolder.id !== 'unfiled') {
          // Only pass folder_id if it's not "unfiled"
          // For unfiled, we'll filter client-side
          params.folder_id = selectedFolder.id;
        }

        if (selectedReferenceType) {
          params.reference_type = selectedReferenceType;
        }

        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        const response = await apiService.getNotes(params);
        
        let notesData = [];
        let paginationData = pagination;
        
        if (response.success && response.data?.notes) {
          notesData = response.data.notes;
          if (response.data.pagination) {
            paginationData = {
              page: response.data.pagination.page || pagination.page,
              limit: response.data.pagination.limit || pagination.limit,
              total: response.data.pagination.total || 0,
              pages: response.data.pagination.pages || 1
            };
          }
        } else if (Array.isArray(response)) {
          notesData = response;
        } else if (response.data && Array.isArray(response.data)) {
          notesData = response.data;
        }

        // Filter for unfiled notes if needed
        let filteredNotesData = notesData;
        if (selectedFolder && selectedFolder.id === 'unfiled') {
          filteredNotesData = notesData.filter(note => !note.folder_id);
        }

        setNotes(filteredNotesData);
        setPagination(paginationData);
      } catch (error) {
        console.error('Error loading notes:', error);
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };

    loadNotes();
  }, [isAuthenticated, pagination.page, selectedFolder, selectedReferenceType, searchQuery]);

  const handleNoteClick = (note) => {
    // Open note in popup for viewing/editing
    setSelectedNote(note);
    setNoteContent(note.content || '');
    setNoteTitle(note.title || '');
    setIsEditing(false);
    setShowNotePopup(true);
  };

  const handleNavigateToReference = async (note) => {
    try {
      if (note.reference_type === 'judgment') {
        const judgment = await apiService.getJudgementById(note.reference_id);
        const judgmentId = judgment?.id || judgment?.cnr || note.reference_id;
        const url = judgmentId ? `/judgment/${judgmentId}` : '/judgment';
        navigate(url, { state: { judgment } });
      } else if (note.reference_type === 'central_act') {
        const act = await apiService.getCentralActById(note.reference_id);
        navigate(`/acts/${act.id || note.reference_id}`, { state: { act } });
      } else if (note.reference_type === 'state_act') {
        const act = await apiService.getStateActById(note.reference_id);
        navigate(`/acts/${act.id || note.reference_id}`, { state: { act } });
      } else {
        // For mappings, navigate to law mapping page
        navigate(`/law-mapping?type=${note.reference_type}`, { 
          state: { highlightId: note.reference_id } 
        });
      }
    } catch (error) {
      console.error('Error navigating to referenced item:', error);
      alert('Failed to load the referenced item');
    }
  };

  const handleSaveNote = async () => {
    if (!selectedNote || !noteContent.trim()) {
      alert('Please enter some content for the note');
      return;
    }

    try {
      setSavingNote(true);
      const noteData = {
        title: noteTitle.substring(0, 200),
        content: noteContent,
        folder_id: selectedNote.folder_id || null
      };

      await apiService.updateNote(selectedNote.id, noteData);
      
      // Update the note in the list
      setNotes(prev => prev.map(note => 
        note.id === selectedNote.id 
          ? { ...note, title: noteTitle, content: noteContent, updated_at: new Date().toISOString() }
          : note
      ));
      
      setIsEditing(false);
      alert('Note saved successfully!');
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note. Please try again.');
    } finally {
      setSavingNote(false);
    }
  };

  const handleFolderClick = (folder) => {
    setSelectedFolder(folder);
    setIsFolderView(true); // Enter folder view mode
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    setSelectedItems([]); // Clear selections when folder changes
  };

  const handleBackFromFolder = () => {
    setIsFolderView(false);
    setSelectedFolder(null);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    setSelectedItems([]); // Clear selections when going back
  };

  const handleDeleteNote = (noteId, e) => {
    if (e) {
      e.stopPropagation();
    }
    // Find the note to get its details
    const note = notes.find(n => n.id === noteId);
    setDeleteItem({ id: noteId, name: note?.title || 'Note' });
    setDeleteType('note');
    setShowDeleteConfirm(true);
  };

  const confirmDeleteNote = async () => {
    if (!deleteItem || deleteType !== 'note') return;
    
    try {
      setDeleting(true);
      await apiService.deleteNote(deleteItem.id);
      // Reload notes
      setNotes(prev => prev.filter(note => note.id !== deleteItem.id));
      setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      setSelectedItems(prev => prev.filter(id => id !== deleteItem.id));
      setShowDeleteConfirm(false);
      setDeleteItem(null);
      setDeleteType(null);
    } catch (error) {
      console.error('Error deleting note:', error);
      setShowDeleteConfirm(false);
      setDeleteItem(null);
      setDeleteType(null);
      // Show error in modal or toast
    } finally {
      setDeleting(false);
    }
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === notes.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(notes.map(note => note.id));
    }
  };

  const handleDeleteMultiple = () => {
    if (selectedItems.length === 0) return;
    
    // Get the notes to delete
    const notesToDelete = notes.filter(n => selectedItems.includes(n.id));
    
    setDeleteItem(notesToDelete);
    setDeleteType('multiple');
    setShowDeleteConfirm(true);
  };

  const confirmDeleteMultiple = async () => {
    if (!deleteItem || !Array.isArray(deleteItem) || deleteItem.length === 0) return;
    
    try {
      setDeleting(true);
      const errors = [];
      
      // Delete each note
      for (const note of deleteItem) {
        try {
          await apiService.deleteNote(note.id);
        } catch (err) {
          console.error(`Error deleting note ${note.id}:`, err);
          errors.push({ id: note.id, error: err.message });
        }
      }
      
      // Remove successfully deleted notes from state
      const deletedIds = deleteItem.map(n => n.id).filter(id => !errors.find(e => e.id === id));
      setNotes(prev => prev.filter(note => !deletedIds.includes(note.id)));
      setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - deletedIds.length) }));
      setSelectedItems([]);
      
      if (errors.length > 0) {
        alert(`Failed to delete ${errors.length} note(s). Please try again.`);
      }
      
      // Close modal
      setShowDeleteConfirm(false);
      setDeleteItem(null);
      setDeleteType(null);
    } catch (err) {
      console.error('Error deleting notes:', err);
      alert('Failed to delete notes. Please try again.');
      setShowDeleteConfirm(false);
      setDeleteItem(null);
      setDeleteType(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      alert('Please enter a folder name.');
      return;
    }

    try {
      setCreatingFolder(true);
      const response = await apiService.createFolder({ name: newFolderName.trim() });
      if (response.success && response.data?.folder) {
        setFolders(prev => [...prev, response.data.folder]);
        setNewFolderName('');
        setShowCreateFolderDialog(false);
      } else {
        alert('Failed to create folder. Please try again.');
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('Failed to create folder. Please try again.');
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleDeleteFolder = (folderId, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    // Find the folder to get its details
    const folder = folders.find(f => f.id === folderId);
    setDeleteItem({ id: folderId, name: folder?.name || 'Folder' });
    setDeleteType('folder');
    setShowDeleteConfirm(true);
  };

  const confirmDeleteFolder = async () => {
    if (!deleteItem || deleteType !== 'folder') return;
    
    try {
      setDeleting(true);
      await apiService.deleteFolder(deleteItem.id);
      
      // Remove folder from state
      setFolders(prev => prev.filter(f => f.id !== deleteItem.id));
      
      // If this folder was selected, clear the selection and exit folder view
      if (selectedFolder?.id === deleteItem.id) {
        setSelectedFolder(null);
        setIsFolderView(false);
      }
      
      setShowDeleteConfirm(false);
      setDeleteItem(null);
      setDeleteType(null);
      
      // Reload notes to reflect the change (notes will now be unfiled)
      // The useEffect will automatically reload notes when selectedFolder changes
    } catch (error) {
      console.error('Error deleting folder:', error);
      setShowDeleteConfirm(false);
      setDeleteItem(null);
      setDeleteType(null);
      // Show error in modal or toast
    } finally {
      setDeleting(false);
    }
  };

  const getFolderNotes = (folderId) => {
    return notes.filter(note => note.folder_id === folderId);
  };

  const getReferenceTypeLabel = (type) => {
    const labels = {
      'judgment': 'Judgment',
      'central_act': 'Central Act',
      'state_act': 'State Act',
      'bns_ipc_mapping': 'BNS-IPC Mapping',
      'bsa_iea_mapping': 'BSA-IEA Mapping',
      'bnss_crpc_mapping': 'BNSS-CrPC Mapping'
    };
    return labels[type] || type;
  };

  const getReferenceTypeColors = (type) => {
    const colors = {
      'judgment': {
        bg: '#1E65AD',
        text: 'white',
        badgeBg: '#E3F2FD',
        badgeText: '#1E65AD',
        border: '#1E65AD'
      },
      'central_act': {
        bg: '#CF9B63',
        text: 'white',
        badgeBg: '#FFF4E6',
        badgeText: '#CF9B63',
        border: '#CF9B63'
      },
      'state_act': {
        bg: '#8C969F',
        text: 'white',
        badgeBg: '#F3F4F6',
        badgeText: '#8C969F',
        border: '#8C969F'
      },
      'bns_ipc_mapping': {
        bg: '#10B981',
        text: 'white',
        badgeBg: '#D1FAE5',
        badgeText: '#10B981',
        border: '#10B981'
      },
      'bsa_iea_mapping': {
        bg: '#F59E0B',
        text: 'white',
        badgeBg: '#FEF3C7',
        badgeText: '#F59E0B',
        border: '#F59E0B'
      },
      'bnss_crpc_mapping': {
        bg: '#8B5CF6',
        text: 'white',
        badgeBg: '#EDE9FE',
        badgeText: '#8B5CF6',
        border: '#8B5CF6'
      }
    };
    return colors[type] || {
      bg: '#1E65AD',
      text: 'white',
      badgeBg: '#E3F2FD',
      badgeText: '#1E65AD',
      border: '#1E65AD'
    };
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 p-3 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            {/* Mobile Back Button */}
            {onBack && (
              <button
                onClick={onBack}
                className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                aria-label="Back to Dashboard"
              >
                <ArrowLeft className="h-5 w-5 text-gray-700" />
              </button>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold mb-0.5 sm:mb-2 truncate" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                Notes
              </h1>
              <p className="text-gray-600 text-[11px] sm:text-sm line-clamp-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Organize and manage your legal research notes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-2.5 sm:p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
                setSelectedItems([]); // Clear selections when filter changes
              }}
              className="w-full pl-7 sm:pl-10 pr-2 sm:pr-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-xs sm:text-sm"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            />
          </div>
          <select
            value={selectedReferenceType}
            onChange={(e) => {
              setSelectedReferenceType(e.target.value);
              setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
              setSelectedItems([]); // Clear selections when filter changes
            }}
            className="px-2.5 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-xs sm:text-sm"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            <option value="">All Types</option>
            <option value="judgment">Judgments</option>
            <option value="central_act">Central Acts</option>
            <option value="state_act">State Acts</option>
            <option value="bns_ipc_mapping">BNS-IPC Mappings</option>
            <option value="bsa_iea_mapping">BSA-IEA Mappings</option>
            <option value="bnss_crpc_mapping">BNSS-CrPC Mappings</option>
          </select>
        </div>
      </div>

      {/* Folder View Header - Show when folder is selected */}
      {isFolderView && selectedFolder && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Back Arrow */}
            <button
              onClick={handleBackFromFolder}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
              title="Back to folders"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            
            {/* Folder Icon with Blue Background */}
            <div 
              className="p-2.5 sm:p-3 rounded-lg flex-shrink-0"
              style={{ backgroundColor: '#E8F0F8' }}
            >
              <Folder className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: '#1E65AD' }} />
            </div>
            
            {/* Folder Name and Note Count */}
            <div className="flex-1 min-w-0">
              <h2 
                className="text-base sm:text-lg font-semibold text-gray-900 mb-0.5 sm:mb-1"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                {selectedFolder.name}
              </h2>
              <p 
                className="text-xs sm:text-sm text-gray-500"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                {getFolderNotes(selectedFolder.id).length} {getFolderNotes(selectedFolder.id).length === 1 ? 'note' : 'notes'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Folders Section - Hide when in folder view */}
      {!isFolderView && (
      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-6 shadow-sm">
        <h2 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-4" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
          Folders
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
          {/* New Folder Card */}
          <div
            onClick={() => setShowCreateFolderDialog(true)}
            className="relative flex flex-col items-center justify-center p-2 sm:p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group hover:shadow-md cursor-pointer"
          >
            <div 
              className="p-1.5 sm:p-3 rounded-lg mb-1 sm:mb-2 transition-transform group-hover:scale-110"
              style={{ backgroundColor: '#CF9B6320' }}
            >
              <FolderPlus 
                className="h-5 w-5 sm:h-8 sm:w-8" 
                style={{ color: '#CF9B63' }}
              />
            </div>
            <h3 className="font-medium text-gray-900 text-[10px] sm:text-sm text-center group-hover:text-blue-700 mb-0.5 sm:mb-1 leading-tight" style={{ fontFamily: 'Roboto, sans-serif' }}>
              New Folder
            </h3>
            <p className="text-[9px] sm:text-xs text-gray-500 leading-tight" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Create new
            </p>
          </div>
          
          {folders.map((folder) => (
            <div
              key={folder.id}
              onClick={() => handleFolderClick(folder)}
              className={`relative flex flex-col items-center p-2 sm:p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 hover:shadow-md group ${
                selectedFolder?.id === folder.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
              }`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleDeleteFolder(folder.id, e);
                }}
                className="absolute top-1 right-1 sm:top-2 sm:right-2 p-1 sm:p-1.5 rounded hover:bg-red-100 flex-shrink-0 transition-colors z-10"
                title="Delete folder"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
              </button>
              <div 
                className="p-1.5 sm:p-3 rounded-lg mb-1 sm:mb-2 transition-transform group-hover:scale-110"
                style={{ backgroundColor: '#1E65AD20' }}
              >
                <Folder className="h-5 w-5 sm:h-8 sm:w-8" style={{ color: '#1E65AD' }} />
              </div>
              <h3 className="font-medium text-gray-900 text-[10px] sm:text-sm text-center group-hover:text-blue-700 mb-0.5 sm:mb-1 truncate w-full px-0.5 leading-tight" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {folder.name}
              </h3>
              <p className="text-[9px] sm:text-xs text-gray-500 leading-tight" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {getFolderNotes(folder.id).length} notes
              </p>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Notes Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-2 sm:mb-4 gap-2">
          <h2 className="text-sm sm:text-lg font-semibold truncate flex-1 min-w-0" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            {isFolderView ? (
              <span className="text-xs sm:text-lg">{selectedFolder?.name} ({pagination.total})</span>
            ) : (
              <>
                <span className="hidden sm:inline">{selectedFolder ? `${selectedFolder.name} Notes` : 'All Notes'}</span>
                <span className="sm:hidden text-xs">{selectedFolder ? selectedFolder.name : 'All Notes'}</span>
                <span className="ml-1 sm:ml-2 text-xs sm:text-lg">({pagination.total})</span>
              </>
            )}
          </h2>
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 sm:p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-blue-100' : 'hover:bg-gray-100'
              }`}
              style={{ color: viewMode === 'grid' ? '#1E65AD' : '#6B7280' }}
              title="Grid View"
            >
              <FileText className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 sm:p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-blue-100' : 'hover:bg-gray-100'
              }`}
              style={{ color: viewMode === 'list' ? '#1E65AD' : '#6B7280' }}
              title="List View"
            >
              <FileText className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {selectedItems.length > 0 && (
          <div className="p-2.5 sm:p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 mb-2 sm:mb-4 rounded-t-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <span className="text-[11px] sm:text-sm font-medium text-blue-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
                <button 
                  onClick={handleSelectAll}
                  className="flex-1 sm:flex-initial px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  {selectedItems.length === notes.length ? 'Deselect All' : 'Select All'}
                </button>
                <button 
                  onClick={handleDeleteMultiple}
                  className="flex-1 sm:flex-initial px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
            <p className="text-gray-500 text-xs sm:text-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Loading notes...
            </p>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <p className="text-gray-500 text-xs sm:text-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
              No notes found. Create your first note from a judgment or act!
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
            {notes.map((note) => {
              const folder = folders.find(f => f.id === note.folder_id);
              const colors = getReferenceTypeColors(note.reference_type);
              return (
                <div
                  key={note.id}
                  onClick={(e) => {
                    // Only open note if clicking on the card itself, not on buttons
                    if (e.target.closest('button') || e.target.closest('input')) {
                      return;
                    }
                    handleNoteClick(note);
                  }}
                  className={`p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 bg-white relative overflow-visible ${
                    selectedItems.includes(note.id) ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200'
                  }`}
                >
                  {/* Selection Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(note.id)}
                    onChange={() => handleSelectItem(note.id)}
                    className="absolute top-2 left-2 sm:top-3 sm:left-3 w-4 h-4 sm:w-5 sm:h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer z-50 bg-white shadow-md"
                    onClick={(e) => e.stopPropagation()}
                    style={{ zIndex: 50 }}
                  />
                  <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2 pl-6 sm:pl-7">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                        <span 
                          className="px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium whitespace-nowrap" 
                          style={{ 
                            fontFamily: 'Roboto, sans-serif',
                            backgroundColor: colors.badgeBg,
                            color: colors.badgeText
                          }}
                        >
                          {getReferenceTypeLabel(note.reference_type)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1.5 sm:mb-2 line-clamp-2 text-sm sm:text-base leading-tight" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {note.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 mb-2 sm:mb-3 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {note.content?.substring(0, 120) || 'No content'}...
                      </p>
                    </div>
                    <div className="relative flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id, e);
                        }}
                        className="p-1 sm:p-1.5 rounded hover:bg-red-100 transition-colors"
                        title="Delete note"
                      >
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 gap-2">
                    <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 flex-1">
                      {folder ? (
                        <span
                          className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium truncate bg-blue-100 text-blue-800 max-w-[100px] sm:max-w-none"
                          style={{ fontFamily: 'Roboto, sans-serif' }}
                        >
                          {folder.name}
                        </span>
                      ) : (
                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          Unfiled
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-[10px] sm:text-xs text-gray-500 flex-shrink-0" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      <Clock className="h-3 w-3 flex-shrink-0" />
                      <span className="whitespace-nowrap">{new Date(note.updated_at || note.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {/* List View Header with Select All */}
            {notes.length > 0 && (
              <div className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                <input
                  type="checkbox"
                  checked={selectedItems.length === notes.length && notes.length > 0}
                  onChange={handleSelectAll}
                  className="rounded w-4 h-4 sm:w-4 sm:h-4 flex-shrink-0"
                />
                <span className="text-xs sm:text-sm text-gray-600 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Select All
                </span>
              </div>
            )}
            {notes.map((note) => {
              const folder = folders.find(f => f.id === note.folder_id);
              const colors = getReferenceTypeColors(note.reference_type);
              return (
                <div
                  key={note.id}
                  onClick={(e) => {
                    // Only open note if clicking on the row itself, not on buttons
                    if (e.target.closest('button') || e.target.closest('input')) {
                      return;
                    }
                    handleNoteClick(note);
                  }}
                  className={`p-2.5 sm:p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md flex items-start sm:items-center justify-between gap-2 sm:gap-3 ${
                    selectedItems.includes(note.id) ? 'bg-blue-50 border-blue-500' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {/* Selection Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(note.id)}
                    onChange={() => handleSelectItem(note.id)}
                    className="rounded w-4 h-4 sm:w-4 sm:h-4 flex-shrink-0 mt-1 sm:mt-0"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex items-start sm:items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                    <div 
                      className="p-1.5 sm:p-2.5 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: colors.badgeBg }}
                    >
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: colors.badgeText }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                        <span 
                          className="px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium whitespace-nowrap" 
                          style={{ 
                            fontFamily: 'Roboto, sans-serif',
                            backgroundColor: colors.badgeBg,
                            color: colors.badgeText
                          }}
                        >
                          {getReferenceTypeLabel(note.reference_type)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1 sm:mb-1.5 text-sm sm:text-base line-clamp-1 sm:truncate leading-tight" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {note.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 sm:line-clamp-1 mb-1.5 sm:mb-2 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {note.content?.substring(0, 80) || 'No content'}...
                      </p>
                      <div className="flex items-center flex-wrap gap-1.5 sm:gap-3 text-[10px] sm:text-xs text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {folder ? (
                          <span className="flex items-center space-x-0.5 sm:space-x-1">
                            <Folder className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate max-w-[80px] sm:max-w-none">{folder.name}</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-0.5 sm:space-x-1 text-gray-400">
                            <Folder className="h-3 w-3 flex-shrink-0" />
                            <span>Unfiled</span>
                          </span>
                        )}
                        <span className="flex items-center space-x-0.5 sm:space-x-1">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          <span className="whitespace-nowrap">{new Date(note.updated_at || note.updatedAt).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(note.id, e);
                    }}
                    className="p-1.5 sm:p-2 rounded hover:bg-red-100 flex-shrink-0 transition-colors mt-1 sm:mt-0"
                    title="Delete note"
                  >
                    <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-4 sm:mt-6 pt-4 border-t border-gray-200">
            <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} notes
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs sm:text-sm text-gray-700 px-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Note Popup Modal */}
      {showNotePopup && selectedNote && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => {
              setShowNotePopup(false);
              setIsEditing(false);
            }}
          />
          
          {/* Popup */}
          <div
            className="fixed bg-white rounded-lg sm:rounded-xl shadow-2xl z-50 flex flex-col w-[95vw] sm:w-[90vw] max-w-[800px] max-h-[95vh] sm:max-h-[90vh]"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              fontFamily: 'Roboto, sans-serif'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div 
              className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 flex-shrink-0"
              style={{ 
                background: 'linear-gradient(90deg, #1E65AD 0%, #CF9B63 100%)',
                borderTopLeftRadius: '0.5rem',
                borderTopRightRadius: '0.5rem'
              }}
            >
              <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white flex-shrink-0" />
                {isEditing ? (
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="flex-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-sm sm:text-base text-white bg-white bg-opacity-20 placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                    placeholder="Note title..."
                    style={{ fontFamily: 'Roboto, sans-serif', color: 'white' }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <h3 className="text-sm sm:text-lg font-bold text-white truncate" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                    {noteTitle || 'Untitled Note'}
                  </h3>
                )}
                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium bg-white bg-opacity-20 text-white whitespace-nowrap" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {getReferenceTypeLabel(selectedNote.reference_type)}
                </span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                {!isEditing ? (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditing(true);
                      }}
                      className="p-1.5 sm:p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                      title="Edit note"
                    >
                      <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigateToReference(selectedNote);
                      }}
                      className="p-1.5 sm:p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                      title="View referenced item"
                    >
                      <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                  </>
                ) : null}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNotePopup(false);
                    setIsEditing(false);
                  }}
                  className="p-1.5 sm:p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                  title="Close"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-2.5 sm:p-4" style={{ minHeight: '200px', maxHeight: 'calc(95vh - 180px)' }}>
              {isEditing ? (
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write your notes here... (Markdown supported)"
                  className="w-full h-full p-2.5 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[250px] sm:min-h-[400px]"
                  style={{ 
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: '13px',
                    lineHeight: '1.6'
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <div className="prose prose-sm max-w-none p-2.5 sm:p-4 text-sm sm:text-base" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <ReactMarkdown>{noteContent || '*No content*'}</ReactMarkdown>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2.5 sm:p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0 gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">Updated: {new Date(selectedNote.updated_at || selectedNote.updatedAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
                {isEditing ? (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditing(false);
                        setNoteContent(selectedNote.content || '');
                        setNoteTitle(selectedNote.title || '');
                      }}
                      className="flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 sm:py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-xs sm:text-sm"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                      disabled={savingNote}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveNote();
                      }}
                      className="flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                      disabled={savingNote}
                    >
                      <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      {savingNote ? 'Saving...' : 'Save'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigateToReference(selectedNote);
                    }}
                    className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    View Source
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Create Folder Dialog */}
      {showCreateFolderDialog && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => {
              setShowCreateFolderDialog(false);
              setNewFolderName('');
            }}
          />
          
          {/* Dialog */}
          <div
            className="fixed bg-white rounded-lg shadow-2xl z-50"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90vw',
              maxWidth: '400px',
              fontFamily: 'Roboto, sans-serif'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                Create New Folder
              </h3>
            </div>
            
            {/* Content */}
            <div className="px-6 py-4">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newFolderName.trim() && !creatingFolder) {
                    handleCreateFolder();
                  }
                }}
                placeholder="Folder name"
                className="w-full px-4 py-2.5 border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                style={{ fontFamily: 'Roboto, sans-serif' }}
                autoFocus
              />
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateFolderDialog(false);
                  setNewFolderName('');
                }}
                disabled={creatingFolder}
                className="px-4 py-2 rounded-lg font-medium text-sm transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={creatingFolder || !newFolderName.trim()}
                className="px-4 py-2 rounded-lg font-medium text-sm transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  fontFamily: 'Roboto, sans-serif',
                  backgroundColor: creatingFolder || !newFolderName.trim() ? '#9CA3AF' : '#1E65AD'
                }}
              >
                {creatingFolder ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deleteItem && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => {
              if (!deleting) {
                setShowDeleteConfirm(false);
                setDeleteItem(null);
                setDeleteType(null);
              }
            }}
          />
          
          {/* Confirmation Card */}
          <div
            className="fixed bg-white rounded-xl shadow-2xl z-50"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90vw',
              maxWidth: '400px',
              fontFamily: 'Roboto, sans-serif'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div 
                  className="p-2.5 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: '#FEE2E2' }}
                >
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 
                    className="text-lg font-semibold text-gray-900"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  >
                    Delete {deleteType === 'folder' ? 'Folder' : deleteType === 'multiple' ? 'Notes' : 'Note'}?
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-4 sm:p-6">
              {deleteType === 'multiple' && Array.isArray(deleteItem) ? (
                <>
                  <p className="text-sm text-gray-700 mb-4">
                    Are you sure you want to delete <strong>{deleteItem.length} note{deleteItem.length > 1 ? 's' : ''}</strong>? 
                    <br />
                    <span className="text-xs text-gray-500 mt-1 block">This action cannot be undone.</span>
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-700 mb-4">
                  Are you sure you want to delete <strong>"{deleteItem?.name || 'this item'}"</strong>? 
                  {deleteType === 'folder' && ' All notes in this folder will become unfiled.'}
                  {deleteType !== 'folder' && deleteType !== 'multiple' && ' This action cannot be undone.'}
                </p>
              )}
              
              {/* Actions */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteItem(null);
                    setDeleteType(null);
                  }}
                  disabled={deleting}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  Cancel
                </button>
                <button
                  onClick={
                    deleteType === 'folder' 
                      ? confirmDeleteFolder 
                      : deleteType === 'multiple' 
                        ? confirmDeleteMultiple 
                        : confirmDeleteNote
                  }
                  disabled={deleting}
                  className="px-4 py-2 rounded-lg transition-colors text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: deleting ? '#9CA3AF' : '#EF4444',
                    fontFamily: 'Roboto, sans-serif'
                  }}
                >
                  {deleting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </span>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Notes;

