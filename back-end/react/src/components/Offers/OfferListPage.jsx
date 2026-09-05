import React, { useState, useMemo } from 'react';
import CustomSelect from '../Common/CustomSelect';
import {
  AppIcon,
  PlusIcon,
  OfferAdminIcon,
  CheckmarkCircle01Icon,
  ClockIcon,
  CancelCircleIcon,
  SearchIcon,
  SparklesIcon,
  EditIcon,
  DeleteIcon,
  CancelIcon,
  AlertIcon,
} from '../../icons';
import './OfferListPage.css';

export default function OfferListPage() {
  const ctx = window.DJANGO_CONTEXT || {};
  const initialOffers = ctx.offersList || [];

  const [offers, setOffers] = useState(initialOffers);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Helper for default local ISO string (YYYY-MM-DDTHH:MM)
  const getLocalDatetimeString = (dateObj) => {
    const d = dateObj || new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const getDefaultFormData = () => {
    const start = new Date();
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    end.setHours(23, 59, 0, 0);

    return {
      offer_text: '',
      start_datetime: getLocalDatetimeString(start),
      end_datetime: getLocalDatetimeString(end),
      is_active: true,
    };
  };

  // Form state
  const [formData, setFormData] = useState(getDefaultFormData);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Fetch updated list from API
  const refreshOffers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/offers/', { headers: { 'Accept': 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        if (data.offers) {
          setOffers(data.offers);
        }
      }
    } catch (err) {
      console.error('Failed to refresh offers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const stats = useMemo(() => {
    const total = offers.length;
    const active = offers.filter(o => o.status === 'Active').length;
    const scheduled = offers.filter(o => o.status === 'Scheduled').length;
    const expiredOrInactive = offers.filter(o => o.status === 'Expired' || o.status === 'Inactive').length;
    return { total, active, scheduled, expiredOrInactive };
  }, [offers]);

  // Filtered offers — search against offer_text
  const filteredOffers = useMemo(() => {
    return offers.filter(o => {
      const text = (o.offer_text || '').toLowerCase();
      const matchesSearch = text.includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' ||
        (o.status && o.status.toLowerCase() === statusFilter.toLowerCase());
      return matchesSearch && matchesStatus;
    });
  }, [offers, searchTerm, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredOffers.length / itemsPerPage) || 1;
  const paginatedOffers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOffers.slice(start, start + itemsPerPage);
  }, [filteredOffers, currentPage]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setFormData(getDefaultFormData());
    setFormError('');
    setShowAddModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = async (item) => {
    setFormError('');
    setFormData({
      offer_text: item.offer_text || '',
      start_datetime: item.start_datetime || getLocalDatetimeString(new Date()),
      end_datetime: item.end_datetime || getLocalDatetimeString(new Date(Date.now() + 86400000)),
      is_active: item.isActive !== undefined ? item.isActive : true,
    });
    setEditTarget(item);

    try {
      const res = await fetch(`/api/offers/${item.id}/`, {
        headers: { 'Accept': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setFormData({
          offer_text: data.offer_text || item.offer_text || '',
          start_datetime: data.start_datetime || item.start_datetime || getLocalDatetimeString(new Date()),
          end_datetime: data.end_datetime || item.end_datetime || getLocalDatetimeString(new Date(Date.now() + 86400000)),
          is_active: data.isActive !== undefined ? data.isActive : true,
        });
      }
    } catch (err) {
      console.error('Failed to fetch offer detail:', err);
    }
  };

  // Validate form
  const validateForm = () => {
    if (!formData.offer_text.trim()) {
      return 'Offer text cannot be empty.';
    }
    if (!formData.start_datetime) {
      return 'Start Date & Time is required.';
    }
    if (!formData.end_datetime) {
      return 'End Date & Time is required.';
    }
    const start = new Date(formData.start_datetime);
    const end = new Date(formData.end_datetime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 'Please enter a valid Start and End Date & Time.';
    }
    if (end <= start) {
      return 'End Date & Time must be later than Start Date & Time.';
    }
    return null;
  };

  // Submit Create
  const handleSaveCreate = async () => {
    const errorMsg = validateForm();
    if (errorMsg) { setFormError(errorMsg); return; }

    setSubmitting(true);
    setFormError('');
    try {
      const res = await fetch('/api/offers/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': ctx.csrfToken || '',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setShowAddModal(false);
        refreshOffers();
      } else {
        setFormError(data.error || 'Failed to create offer.');
      }
    } catch (err) {
      setFormError('Error connecting to server.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit
  const handleSaveEdit = async () => {
    const errorMsg = validateForm();
    if (errorMsg) { setFormError(errorMsg); return; }

    setSubmitting(true);
    setFormError('');
    try {
      const res = await fetch(`/api/offers/${editTarget.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': ctx.csrfToken || '',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setEditTarget(null);
        refreshOffers();
      } else {
        setFormError(data.error || 'Failed to update offer.');
      }
    } catch (err) {
      setFormError('Error connecting to server.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Offer
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/offers/${deleteTarget.id}/`, {
        method: 'DELETE',
        headers: { 'X-CSRFToken': ctx.csrfToken || '' },
      });
      if (res.ok) {
        setDeleteTarget(null);
        refreshOffers();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete offer.');
      }
    } catch {
      alert('Error connecting to server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePageChange = (p) => {
    if (p >= 1 && p <= totalPages) {
      setCurrentPage(p);
    }
  };

  const truncateText = (str, n = 80) => {
    if (!str) return '';
    return str.length > n ? str.substr(0, n - 1) + '...' : str;
  };

  return (
    <div className="offer-page-container">
      {/* Toast */}
      {toastMessage && (
        <div className={`offer-toast ${toastMessage.type}`}>
          {toastMessage.text}
        </div>
      )}

      {/* Header */}
      <div className="offer-header-row">
        <div className="offer-title-group">
          <h1>Offers</h1>
          <p>Create, schedule, and manage promotional offers displayed on the customer website.</p>
        </div>
        <button className="btn-add-offer" onClick={handleOpenAddModal}>
          <AppIcon icon={PlusIcon} size={16} />
          Add Offer
        </button>
      </div>

      {/* Stats Grid */}
      <div className="offer-stats-grid">
        <div className="offer-stat-card">
          <div className="stat-icon-wrapper indigo">
            <AppIcon icon={OfferAdminIcon} size={20} />
          </div>
          <div className="stat-details">
            <span>Total Offers</span>
            <h3>{stats.total}</h3>
          </div>
        </div>

        <div className="offer-stat-card">
          <div className="stat-icon-wrapper emerald">
            <AppIcon icon={CheckmarkCircle01Icon} size={20} />
          </div>
          <div className="stat-details">
            <span>Active Offers</span>
            <h3>{stats.active}</h3>
          </div>
        </div>

        <div className="offer-stat-card">
          <div className="stat-icon-wrapper amber">
            <AppIcon icon={ClockIcon} size={20} />
          </div>
          <div className="stat-details">
            <span>Scheduled</span>
            <h3>{stats.scheduled}</h3>
          </div>
        </div>

        <div className="offer-stat-card">
          <div className="stat-icon-wrapper rose">
            <AppIcon icon={CancelCircleIcon} size={20} />
          </div>
          <div className="stat-details">
            <span>Expired / Inactive</span>
            <h3>{stats.expiredOrInactive}</h3>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="offer-table-card">
        {/* Filter Bar */}
        <div className="offer-filter-bar">
          <div className="search-input-wrapper">
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
              <AppIcon icon={SearchIcon} size={15} />
            </span>
            <input
              type="text"
              placeholder="Search offer text..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              style={{ paddingLeft: '34px' }}
            />
          </div>

          <div className="filter-select-group">
            <CustomSelect
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'Active', label: 'Active' },
                { value: 'Scheduled', label: 'Scheduled' },
                { value: 'Expired', label: 'Expired' },
                { value: 'Inactive', label: 'Inactive' }
              ]}
              minWidth="140px"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="offer-table-wrapper">
          <table className="offer-table">
            <thead>
              <tr>
                <th style={{ width: '48%', minWidth: '240px' }}>Offer</th>
                <th style={{ width: '28%', minWidth: '210px' }}>Schedule</th>
                <th style={{ width: '14%', minWidth: '110px' }}>Status</th>
                <th style={{ width: '10%', minWidth: '90px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOffers.length > 0 ? (
                paginatedOffers.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div className="offer-name-box">
                        <div className="offer-avatar-icon">
                          <AppIcon icon={SparklesIcon} size={18} color="#6657ec" />
                        </div>
                        <div className="offer-meta-info">
                          <strong style={{ whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                            {truncateText(item.offer_text, 100)}
                          </strong>
                        </div>
                      </div>
                    </td>
                    <td className="offer-schedule-cell">
                      {item.schedule ? (
                        <div className="schedule-lines">
                          {item.schedule.split('\n').map((line, idx) => (
                            <span key={idx} className={`schedule-line ${idx > 0 ? 'schedule-line-sub' : ''}`}>
                              {line}
                            </span>
                          ))}
                        </div>
                      ) : '—'}
                    </td>
                    <td>
                      <span className={`badge-status ${(item.status || '').toLowerCase()}`}>
                        {item.status === 'Active' && '● Active'}
                        {item.status === 'Scheduled' && 'Scheduled'}
                        {item.status === 'Expired' && 'Expired'}
                        {item.status === 'Inactive' && '○ Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-btn-group" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn-icon-action" title="Edit Offer" aria-label="Edit Offer" onClick={() => handleOpenEditModal(item)}>
                          <AppIcon icon={EditIcon} size={15} />
                        </button>
                        <button className="btn-icon-action delete" title="Delete Offer" aria-label="Delete Offer" onClick={() => setDeleteTarget(item)}>
                          <AppIcon icon={DeleteIcon} size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">
                    <div className="empty-state-box">
                      <AppIcon icon={OfferAdminIcon} size={36} color="#94a3b8" />
                      <h3>No offers found</h3>
                      <p>No offer entries matching your current search or filter criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer & Pagination */}
        <div className="offer-footer-bar">
          <div className="footer-info">
            Showing {filteredOffers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredOffers.length)} of {filteredOffers.length} offers
          </div>

          {totalPages > 1 && (
            <div className="pagination-group">
              <button
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`page-btn ${p === currentPage ? 'active' : ''}`}
                  onClick={() => handlePageChange(p)}
                >
                  {p}
                </button>
              ))}
              <button
                className="page-btn"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CREATE OFFER MODAL */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Create & Schedule Offer</h2>
              <button className="btn-modal-close" onClick={() => setShowAddModal(false)} aria-label="Close modal">
                <AppIcon icon={CancelIcon} size={20} />
              </button>
            </div>

            <div className="modal-body">
              {formError && (
                <div className="error-banner d-flex align-items-center gap-2">
                  <AppIcon icon={AlertIcon} size={16} color="#ef4444" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="modal-form-grid">
                <div className="form-group full">
                  <label>Offer <span style={{ color: '#ef4444' }}>*</span></label>
                  <textarea
                    rows="6"
                    placeholder={'Write your offer here...\n\nExample:\nFLAT 20% OFF ON SMART WATCHES!\nLimited Time Offer\nShop Now & Save More!\nFree Delivery on Orders ₹999+'}
                    value={formData.offer_text}
                    onChange={(e) => setFormData({ ...formData, offer_text: e.target.value })}
                    style={{ fontFamily: 'inherit', resize: 'vertical', fontSize: '14px', lineHeight: '1.6' }}
                  />
                  <small style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                    Supports line breaks and formatted text.
                  </small>
                </div>

                <div className="form-group">
                  <label>Start Date & Time <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="datetime-local"
                    value={formData.start_datetime}
                    onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Date & Time <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="datetime-local"
                    value={formData.end_datetime}
                    onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn-primary" disabled={submitting} onClick={handleSaveCreate}>
                {submitting ? 'Saving...' : 'Create Offer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT OFFER MODAL */}
      {editTarget && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Edit Offer & Schedule</h2>
              <button className="btn-modal-close" onClick={() => setEditTarget(null)} aria-label="Close modal">
                <AppIcon icon={CancelIcon} size={20} />
              </button>
            </div>

            <div className="modal-body">
              {formError && (
                <div className="error-banner d-flex align-items-center gap-2">
                  <AppIcon icon={AlertIcon} size={16} color="#ef4444" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="modal-form-grid">
                <div className="form-group full">
                  <label>Offer <span style={{ color: '#ef4444' }}>*</span></label>
                  <textarea
                    rows="6"
                    value={formData.offer_text}
                    onChange={(e) => setFormData({ ...formData, offer_text: e.target.value })}
                    style={{ fontFamily: 'inherit', resize: 'vertical', fontSize: '14px', lineHeight: '1.6' }}
                  />
                </div>

                <div className="form-group">
                  <label>Start Date & Time <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="datetime-local"
                    value={formData.start_datetime}
                    onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Date & Time <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="datetime-local"
                    value={formData.end_datetime}
                    onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setEditTarget(null)}>Cancel</button>
              <button className="btn-primary" disabled={submitting} onClick={handleSaveEdit}>
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button className="btn-modal-close" onClick={() => setDeleteTarget(null)} aria-label="Close modal">
                <AppIcon icon={CancelIcon} size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ textAlign: 'center', padding: '24px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                <AppIcon icon={DeleteIcon} size={42} color="#ef4444" />
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#0f172a' }}>Delete Offer?</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                Are you sure you want to delete this offer?
                <br />
                <em style={{ color: '#94a3b8', fontSize: '12px' }}>
                  "{truncateText(deleteTarget.offer_text, 60)}"
                </em>
              </p>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button className="btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn-danger" disabled={submitting} onClick={handleConfirmDelete}>
                {submitting ? 'Deleting...' : 'Delete Offer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
