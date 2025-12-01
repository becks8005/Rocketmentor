import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Plus, 
  MagnifyingGlass, 
  Copy, 
  PencilSimple, 
  Trash,
  Sparkle,
  CheckCircle,
  Calendar,
  Briefcase,
  Download,
  FileText
} from '@phosphor-icons/react';
import { useApp } from '../context/AppContext';
import { Card, Button, Badge, Input, Modal, Textarea, Select } from '../components/ui';
import type { Win } from '../types';
import { generateId, formatDate, generateWinDescription } from '../utils/helpers';
import { COMPETENCIES } from '../data/constants';

// Sample wins for inspiration when library is empty
const SAMPLE_WINS = [
  {
    title: "Led cross-functional initiative",
    description: "Coordinated 3 teams to deliver Q2 product launch ahead of schedule, resulting in 15% uptick in user engagement.",
    competencies: ["leadership", "communication"]
  },
  {
    title: "Optimized key workflow",
    description: "Identified bottleneck in approval process and implemented automation, reducing turnaround time from 5 days to 1 day.",
    competencies: ["problem-solving", "technical"]
  },
  {
    title: "Mentored junior team member",
    description: "Structured weekly 1:1s and pair programming sessions that accelerated new hire's ramp-up by 40%.",
    competencies: ["leadership", "collaboration"]
  }
];

export const WinsPage: React.FC = () => {
  const { state, dispatch } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCompetency, setFilterCompetency] = useState<string>('');
  const [filterProject, setFilterProject] = useState<string>('');
  const [selectedWins, setSelectedWins] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWin, setEditingWin] = useState<Win | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showSampleWin, setShowSampleWin] = useState(true);

  const [newWin, setNewWin] = useState({
    rawText: '',
    project: '',
    competencyTags: [] as string[],
    metric: '',
  });

  const { wins } = state;

  // Get unique projects from wins
  const projects = useMemo(() => {
    const projectSet = new Set(wins.map(w => w.project).filter(Boolean));
    return Array.from(projectSet) as string[];
  }, [wins]);

  // Filter wins
  const filteredWins = useMemo(() => {
    return wins.filter((win) => {
      const matchesSearch = !searchQuery || 
        win.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        win.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCompetency = !filterCompetency || 
        win.competencyTags.includes(filterCompetency);
      
      const matchesProject = !filterProject || 
        win.project === filterProject;

      return matchesSearch && matchesCompetency && matchesProject;
    });
  }, [wins, searchQuery, filterCompetency, filterProject]);

  const handleAddWin = () => {
    if (!newWin.rawText.trim()) return;

    const title = newWin.rawText.split(/[.!?]/)[0].trim().slice(0, 100);
    const description = generateWinDescription(title, newWin.rawText);

    dispatch({
      type: 'ADD_WIN',
      payload: {
        id: generateId(),
        title,
        description,
        rawText: newWin.rawText,
        project: newWin.project,
        competencyTags: newWin.competencyTags,
        date: new Date().toISOString(),
        sourceType: 'manual',
        metric: newWin.metric,
      }
    });

    setNewWin({ rawText: '', project: '', competencyTags: [], metric: '' });
    setShowAddModal(false);
  };

  const handleUpdateWin = () => {
    if (!editingWin) return;

    dispatch({ type: 'UPDATE_WIN', payload: editingWin });
    setEditingWin(null);
  };

  const handleDeleteWin = (winId: string) => {
    if (confirm('Are you sure you want to delete this win?')) {
      dispatch({ type: 'DELETE_WIN', payload: winId });
    }
  };

  const handleToggleSelect = (winId: string) => {
    setSelectedWins(prev => 
      prev.includes(winId)
        ? prev.filter(id => id !== winId)
        : [...prev, winId]
    );
  };

  const handleSelectAll = () => {
    if (selectedWins.length === filteredWins.length) {
      setSelectedWins([]);
    } else {
      setSelectedWins(filteredWins.map(w => w.id));
    }
  };

  const handleExport = () => {
    const winsToExport = wins.filter(w => selectedWins.includes(w.id));
    const exportText = winsToExport
      .map(w => `• ${w.title}\n${w.description}\n`)
      .join('\n---\n\n');
    
    navigator.clipboard.writeText(exportText);
    setShowExportModal(false);
    setSelectedWins([]);
  };

  const handleExportAll = (format: 'csv' | 'markdown') => {
    const winsToExport = wins;
    
    if (format === 'csv') {
      const headers = ['Title', 'Description', 'Project', 'Date', 'Competencies', 'Source'];
      const rows = winsToExport.map(w => [
        `"${w.title.replace(/"/g, '""')}"`,
        `"${w.description.replace(/"/g, '""')}"`,
        `"${(w.project || '').replace(/"/g, '""')}"`,
        `"${formatDate(w.date)}"`,
        `"${w.competencyTags.map(tag => COMPETENCIES.find(c => c.id === tag)?.name || tag).join(', ')}"`,
        `"${w.sourceType}"`
      ]);
      
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `wins-export-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    } else {
      const mdContent = winsToExport.map(w => {
        const competencyNames = w.competencyTags
          .map(tag => COMPETENCIES.find(c => c.id === tag)?.name || tag)
          .join(', ');
        return `## ${w.title}\n\n${w.description}\n\n- **Date:** ${formatDate(w.date)}${w.project ? `\n- **Project:** ${w.project}` : ''}${competencyNames ? `\n- **Competencies:** ${competencyNames}` : ''}\n`;
      }).join('\n---\n\n');
      
      const blob = new Blob([`# Win History\n\n${mdContent}`], { type: 'text/markdown;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `wins-export-${new Date().toISOString().split('T')[0]}.md`;
      link.click();
      URL.revokeObjectURL(link.href);
    }
  };

  const handleRegenerateDescription = async () => {
    if (!editingWin) return;
    
    const newDescription = generateWinDescription(
      editingWin.title, 
      editingWin.rawText || editingWin.title
    );
    
    setEditingWin({ ...editingWin, description: newDescription });
  };

  const toggleCompetencyTag = (compId: string) => {
    if (showAddModal) {
      setNewWin(prev => ({
        ...prev,
        competencyTags: prev.competencyTags.includes(compId)
          ? prev.competencyTags.filter(c => c !== compId)
          : [...prev.competencyTags, compId]
      }));
    } else if (editingWin) {
      setEditingWin({
        ...editingWin,
        competencyTags: editingWin.competencyTags.includes(compId)
          ? editingWin.competencyTags.filter(c => c !== compId)
          : [...editingWin.competencyTags, compId]
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div data-guide="wins-header">
          <h1 className="text-2xl font-bold text-text-primary">
            Wins
          </h1>
          <p className="text-text-secondary mt-1 max-w-[420px] md:max-w-lg lg:max-w-xl">
            Capture accomplishments as they happen. The AI converts raw notes into STAR-format bullets you can copy straight into reviews or 1:1 prep.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedWins.length > 0 && (
            <Button
              variant="secondary"
              onClick={() => setShowExportModal(true)}
              icon={<Copy className="w-4 h-4" />}
            >
              Export {selectedWins.length} selected
            </Button>
          )}
          
          {/* Export All Dropdown */}
          <div className="relative">
            <Button
              variant="secondary"
              onClick={() => wins.length > 0 && setShowExportDropdown(!showExportDropdown)}
              icon={<Download className="w-4 h-4" />}
              disabled={wins.length === 0}
            >
              Export
            </Button>
            {showExportDropdown && wins.length > 0 && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowExportDropdown(false)}
                />
                <div 
                  className="absolute right-0 mt-2 w-48 rounded-lg border shadow-lg z-50 overflow-hidden"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-subtle)',
                  }}
                >
                  <button
                    onClick={() => {
                      handleExportAll('csv');
                      setShowExportDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm flex items-center gap-2 hover:bg-bg-hover transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <FileText className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                    Export as CSV
                  </button>
                  <button
                    onClick={() => {
                      handleExportAll('markdown');
                      setShowExportDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm flex items-center gap-2 hover:bg-bg-hover transition-colors border-t"
                    style={{ color: 'var(--text-primary)', borderColor: 'var(--border-subtle)' }}
                  >
                    <FileText className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                    Export as Markdown
                  </button>
                </div>
              </>
            )}
          </div>
          
          <div data-guide="add-win">
            <Button
              variant="primary"
              onClick={() => setShowAddModal(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Win
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card padding="md" className="bg-bg-secondary/50" data-guide="filters">
        <div className="flex flex-col md:flex-row gap-3 items-stretch">
          <div className="w-full md:w-2/4">
            <Input
              placeholder="Search wins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<MagnifyingGlass className="w-4 h-4" />}
            />
          </div>
          <div className="w-full md:w-1/4">
            <Select
              options={[
                { value: '', label: 'All Competencies' },
                ...COMPETENCIES.map(c => ({ value: c.id, label: c.name }))
              ]}
              value={filterCompetency}
              onChange={setFilterCompetency}
              placeholder="Filter by competency"
            />
          </div>
          <div className="w-full md:w-1/4">
            <Select
              options={[
                { value: '', label: 'All Projects' },
                ...projects.map(p => ({ value: p, label: p }))
              ]}
              value={filterProject}
              onChange={setFilterProject}
              placeholder="Filter by project"
            />
          </div>
        </div>

        {filteredWins.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-primary">
            <button
              onClick={handleSelectAll}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              {selectedWins.length === filteredWins.length ? 'Deselect all' : 'Select all'}
            </button>
            <span className="text-sm text-text-muted">
              {filteredWins.length} win{filteredWins.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </Card>

      {/* Wins List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredWins.length === 0 ? (
            <>
              {wins.length === 0 ? (
                <>
                  {/* Header for empty state */}
                  <Card padding="lg" className="text-center mb-4">
                    <Trophy className="w-12 h-12 text-text-muted mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-text-primary mb-2">
                      No wins yet
                    </h3>
                    <p className="text-text-secondary mb-4">
                      Add your first win to start building your proof point library
                    </p>
                    <Button variant="primary" onClick={() => setShowAddModal(true)}>
                      Add Your First Win
                    </Button>
                  </Card>
                  
                  {/* Sample inspiration card */}
                  {showSampleWin && (
                    <div className="space-y-3">
                      <p className="text-sm text-text-muted mb-2">Here's an example to inspire your first win:</p>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Card 
                          padding="md" 
                          className="border-dashed"
                          style={{ 
                            backgroundColor: 'rgba(128, 128, 128, 0.05)',
                            borderColor: 'rgba(128, 128, 128, 0.3)',
                            borderStyle: 'dashed'
                          }}
                        >
                          <div className="flex items-start gap-4">
                            {/* Disabled checkbox placeholder */}
                            <div
                              className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-1"
                              style={{ 
                                borderColor: 'rgba(128, 128, 128, 0.3)',
                                backgroundColor: 'rgba(128, 128, 128, 0.08)'
                              }}
                            />

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <span 
                                      className="text-xs font-medium px-2.5 py-1 rounded-full"
                                      style={{ 
                                        backgroundColor: 'rgba(128, 128, 128, 0.15)',
                                        color: 'rgba(128, 128, 128, 0.8)'
                                      }}
                                    >
                                      Sample for inspiration
                                    </span>
                                  </div>
                                  <h3 className="font-medium" style={{ color: 'rgba(128, 128, 128, 0.7)' }}>
                                    {SAMPLE_WINS[0].title}
                                  </h3>
                                  <p className="text-sm mt-1 line-clamp-2" style={{ color: 'rgba(128, 128, 128, 0.55)' }}>
                                    {SAMPLE_WINS[0].description}
                                  </p>
                                </div>
                                
                                {/* Delete button */}
                                <button
                                  onClick={() => setShowSampleWin(false)}
                                  className="p-2 rounded-lg transition-colors flex-shrink-0"
                                  style={{ color: 'rgba(128, 128, 128, 0.5)' }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(128, 128, 128, 0.1)';
                                    e.currentTarget.style.color = 'rgba(128, 128, 128, 0.8)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = 'rgba(128, 128, 128, 0.5)';
                                  }}
                                  title="Dismiss sample"
                                >
                                  <Trash className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Meta */}
                              <div className="flex items-center gap-2 flex-wrap mt-3">
                                {SAMPLE_WINS[0].competencies.map((tag) => {
                                  const comp = COMPETENCIES.find(c => c.id === tag);
                                  return (
                                    <span 
                                      key={tag} 
                                      className="text-xs px-2 py-0.5 rounded-full"
                                      style={{
                                        backgroundColor: 'rgba(128, 128, 128, 0.12)',
                                        color: 'rgba(128, 128, 128, 0.65)'
                                      }}
                                    >
                                      {comp?.name || tag}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    </div>
                  )}
                </>
              ) : (
                <Card padding="lg" className="text-center">
                  <Trophy className="w-12 h-12 text-text-muted mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-text-primary mb-2">
                    No matching wins
                  </h3>
                  <p className="text-text-secondary mb-4">
                    Try adjusting your filters
                  </p>
                </Card>
              )}
            </>
          ) : (
            filteredWins.map((win, index) => (
              <motion.div
                key={win.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.02 }}
              >
                <Card 
                  padding="md" 
                  className={`
                    transition-all
                    ${selectedWins.includes(win.id) ? 'border-accent-amber bg-accent-amber/5' : ''}
                  `}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleSelect(win.id)}
                      className={`
                        w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-1
                        transition-colors
                        ${selectedWins.includes(win.id)
                          ? 'bg-accent-amber border-accent-amber'
                          : 'border-border-secondary hover:border-border-accent'
                        }
                      `}
                    >
                      {selectedWins.includes(win.id) && (
                        <CheckCircle className="w-3 h-3 text-white" />
                      )}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-medium text-text-primary">{win.title}</h3>
                          <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                            {win.description}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => setEditingWin(win)}
                            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
                          >
                            <PencilSimple className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteWin(win.id)}
                            className="p-2 rounded-lg text-text-muted hover:text-accent-rose hover:bg-accent-rose/10 transition-colors"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-3 flex-wrap mt-3">
                        {win.competencyTags.map((tag) => {
                          const comp = COMPETENCIES.find(c => c.id === tag);
                          return (
                            <Badge key={tag} variant="purple" size="sm">
                              {comp?.name || tag}
                            </Badge>
                          );
                        })}
                        
                        {win.project && (
                          <div className="flex items-center gap-1 text-xs text-text-muted">
                            <Briefcase className="w-3 h-3" />
                            {win.project}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1 text-xs text-text-muted">
                          <Calendar className="w-3 h-3" />
                          {formatDate(win.date)}
                        </div>

                        <Badge variant="default" size="sm">
                          {win.sourceType}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Add Win Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Win"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              What happened?
            </label>
            <Textarea
              value={newWin.rawText}
              onChange={(e) => setNewWin(prev => ({ ...prev, rawText: e.target.value }))}
              placeholder="Describe what you accomplished. Be specific about your contribution and the outcome..."
              rows={4}
              hint="We'll turn this into a STAR-format bullet"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Project (optional)"
              value={newWin.project}
              onChange={(e) => setNewWin(prev => ({ ...prev, project: e.target.value }))}
              placeholder="e.g., Client X Strategy"
            />
            <Input
              label="Metric (optional)"
              value={newWin.metric}
              onChange={(e) => setNewWin(prev => ({ ...prev, metric: e.target.value }))}
              placeholder="e.g., 20% faster, $50k saved"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Linked Competencies
            </label>
            <div className="flex flex-wrap gap-2">
              {COMPETENCIES.map((comp) => (
                <button
                  key={comp.id}
                  onClick={() => toggleCompetencyTag(comp.id)}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm transition-all
                    ${newWin.competencyTags.includes(comp.id)
                      ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/30'
                      : 'bg-bg-tertiary text-text-secondary border border-border-primary hover:border-border-secondary'
                    }
                  `}
                >
                  {comp.icon} {comp.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border-primary">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
              <Button 
              variant="primary" 
              onClick={handleAddWin}
              disabled={!newWin.rawText.trim()}
              icon={<Sparkle className="w-4 h-4" />}
            >
              Turn into Proof Point
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Win Modal */}
      <Modal
        isOpen={!!editingWin}
        onClose={() => setEditingWin(null)}
        title="Edit Win"
        size="lg"
      >
        {editingWin && (
          <div className="space-y-4">
            <Input
              label="Title"
              value={editingWin.title}
              onChange={(e) => setEditingWin({ ...editingWin, title: e.target.value })}
            />

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-text-primary">
                  Description (STAR format)
                </label>
                <button
                  onClick={handleRegenerateDescription}
                  className="text-xs text-accent-cyan hover:underline flex items-center gap-1"
                >
                  <Sparkle className="w-3 h-3" />
                  Regenerate
                </button>
              </div>
              <Textarea
                value={editingWin.description}
                onChange={(e) => setEditingWin({ ...editingWin, description: e.target.value })}
                rows={6}
              />
            </div>

            <Input
              label="Project"
              value={editingWin.project || ''}
              onChange={(e) => setEditingWin({ ...editingWin, project: e.target.value })}
            />

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Linked Competencies
              </label>
              <div className="flex flex-wrap gap-2">
                {COMPETENCIES.map((comp) => (
                  <button
                    key={comp.id}
                    onClick={() => toggleCompetencyTag(comp.id)}
                    className={`
                      px-3 py-1.5 rounded-lg text-sm transition-all
                      ${editingWin.competencyTags.includes(comp.id)
                        ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/30'
                        : 'bg-bg-tertiary text-text-secondary border border-border-primary hover:border-border-secondary'
                      }
                    `}
                  >
                    {comp.icon} {comp.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border-primary">
              <Button variant="secondary" onClick={() => setEditingWin(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleUpdateWin}>
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Wins"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-text-secondary">
            Export {selectedWins.length} selected win{selectedWins.length !== 1 ? 's' : ''} to clipboard.
            Perfect for pasting into performance reviews or 1:1 notes.
          </p>

          <div className="bg-bg-tertiary rounded-xl p-4 max-h-60 overflow-y-auto">
            {wins.filter(w => selectedWins.includes(w.id)).map((win, i) => (
              <div key={win.id} className={i > 0 ? 'mt-4 pt-4 border-t border-border-primary' : ''}>
                <p className="font-medium text-text-primary">• {win.title}</p>
                <p className="text-sm text-text-secondary mt-1">{win.description}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border-primary">
            <Button variant="secondary" onClick={() => setShowExportModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleExport}
              icon={<Copy className="w-4 h-4" />}
            >
              Copy to Clipboard
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

