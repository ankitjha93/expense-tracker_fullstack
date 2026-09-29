import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/authContext';
import { useToast } from '../../context/toastContext';
import defaultAvatar from '../../img/avatar.png';
import { AVATAR_PRESETS, AURA_COLORS, ROLE_PRESETS, getAvatarDataUrl } from './avatarPresets';
import { compressAndCropAvatar, getDataUrlSizeKb } from '../../utils/imageUtils';

function ProfileModal({ isOpen, onClose }) {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();

  const userMeta = user?.user_metadata || {};
  const currentAvatar = userMeta.avatar_url || defaultAvatar;
  const currentName = userMeta.full_name || (user?.email ? user.email.split('@')[0] : 'Fintech User');
  const currentRole = userMeta.role || 'Wealth Builder';
  const currentAura = userMeta.aura_color || 'emerald';

  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' | 'upload'
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(currentAvatar);
  const [fullName, setFullName] = useState(currentName);
  const [role, setRole] = useState(currentRole);
  const [auraColor, setAuraColor] = useState(currentAura);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Sync state whenever modal opens or user updates
  useEffect(() => {
    if (isOpen) {
      const userKey = user?.id ? `user_custom_profile_${user.id}` : 'user_custom_profile';
      const cached = (() => {
        try {
          return (
            (user?.id && JSON.parse(localStorage.getItem(userKey))) ||
            JSON.parse(localStorage.getItem('user_custom_profile')) ||
            {}
          );
        } catch {
          return {};
        }
      })();
      const meta = user?.user_metadata || {};
      setSelectedAvatarUrl(cached.avatar_url || meta.avatar_url || defaultAvatar);
      setFullName(meta.full_name || cached.full_name || (user?.email ? user.email.split('@')[0] : 'Fintech User'));
      setRole(meta.role || cached.role || 'Wealth Builder');
      setAuraColor(meta.aura_color || cached.aura_color || 'emerald');
    }
  }, [isOpen, user]);

  const handleSelectPreset = (preset) => {
    if (preset.id === 'original') {
      setSelectedAvatarUrl(defaultAvatar);
    } else {
      setSelectedAvatarUrl(getAvatarDataUrl(preset.svg));
    }
  };

  const handleFileProcess = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image (.png, .jpg, .webp)', 'Invalid File');
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      toast.error('Image must be under 12MB', 'File Too Large');
      return;
    }

    try {
      setUploadingPhoto(true);
      // Center-crop and compress to 160x160 @ 0.82 quality
      const compressedDataUrl = await compressAndCropAvatar(file, 160, 0.82);
      setSelectedAvatarUrl(compressedDataUrl);
      const sizeKb = getDataUrlSizeKb(compressedDataUrl);
      toast.success(`Photo optimized to ~${sizeKb} KB & ready to save!`, 'Photo Ready');
    } catch (err) {
      console.error('Error optimizing photo:', err);
      toast.error('Failed to process image. Please try another file.', 'Upload Error');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileProcess(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFileProcess(file);
  };

  const isCustomPhoto = Boolean(
    selectedAvatarUrl &&
    !selectedAvatarUrl.startsWith('data:image/svg+xml') &&
    selectedAvatarUrl !== defaultAvatar
  );

  const handleRemovePhoto = () => {
    setSelectedAvatarUrl(defaultAvatar);
    toast.info('Custom photo removed. Click Save Profile to apply.', 'Photo Cleared');
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateProfile({
        fullName: fullName.trim() || currentName,
        avatarUrl: selectedAvatarUrl,
        role: role.trim() || 'Wealth Builder',
        auraColor: auraColor || 'emerald'
      });
      toast.success('Your profile and avatar have been updated!', 'Profile Saved');
      onClose();
    } catch (err) {
      console.error('Save profile error:', err);
      toast.error('Failed to update profile', 'Error');
    } finally {
      setSaving(false);
    }
  };

  const activeAura = AURA_COLORS.find(a => a.id === auraColor) || AURA_COLORS[0];

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <ModalContent
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
          {/* Header */}
          <div className="modal-header">
            <div className="header-title">
              <span className="sparkle">✨</span>
              <h3>Customize Profile & Avatar</h3>
            </div>
            <button type="button" className="close-btn" onClick={onClose}>✕</button>
          </div>

          {/* Live Preview Card */}
          <div className="live-preview-card">
            <div
              className="preview-avatar-wrap"
              style={{
                boxShadow: `0 0 25px ${activeAura.shadow}`,
                border: `2px solid ${activeAura.color}`
              }}
            >
              <img src={selectedAvatarUrl} alt="Avatar Preview" />
              <span
                className="status-dot"
                style={{ background: activeAura.color, boxShadow: `0 0 10px ${activeAura.color}` }}
              />
            </div>
            <div className="preview-info">
              <h4>{fullName.trim() || 'Your Name'}</h4>
              <div className="preview-badges">
                <span
                  className="role-pill"
                  style={{
                    background: `${activeAura.color}20`,
                    borderColor: `${activeAura.color}50`,
                    color: activeAura.color
                  }}
                >
                  {role.trim() || 'Wealth Builder'}
                </span>
                <span className="email-text">{user?.email || 'user@example.com'}</span>
              </div>
            </div>
          </div>

          {/* Tabs for Avatar Selection */}
          <div className="tabs-bar">
            <button
              type="button"
              className={`tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
              onClick={() => setActiveTab('gallery')}
            >
              🎨 Curated Gallery
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              📷 Upload Photo
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-body">
            {activeTab === 'gallery' && (
              <div className="gallery-grid">
                {AVATAR_PRESETS.map((preset) => {
                  const presetUrl = preset.id === 'original' ? defaultAvatar : getAvatarDataUrl(preset.svg);
                  const isSelected = selectedAvatarUrl === presetUrl;
                  return (
                    <motion.div
                      key={preset.id}
                      className={`preset-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectPreset(preset)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        borderColor: isSelected ? activeAura.color : 'rgba(255, 255, 255, 0.08)'
                      }}
                    >
                      <img src={presetUrl} alt={preset.name} />
                      <span className="preset-name">{preset.name}</span>
                      {isSelected && (
                        <span
                          className="check-badge"
                          style={{ background: activeAura.color }}
                        >
                          ✓
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}

            {activeTab === 'upload' && (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileUpload}
                />

                {isCustomPhoto ? (
                  <div className="custom-photo-card">
                    <div
                      className="photo-preview-ring"
                      style={{
                        borderColor: activeAura.color,
                        boxShadow: `0 0 20px ${activeAura.shadow}`
                      }}
                    >
                      <img src={selectedAvatarUrl} alt="Active Custom Avatar" />
                    </div>
                    <div className="photo-info">
                      <div className="photo-badge">
                        <span className="dot" style={{ background: activeAura.color }} />
                        <span>Active Custom Photo</span>
                      </div>
                      <p className="photo-meta">
                        Optimized & Cloud-Ready • ~{getDataUrlSizeKb(selectedAvatarUrl)} KB
                      </p>
                      <div className="photo-actions">
                        <button
                          type="button"
                          className="btn-replace"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingPhoto}
                        >
                          {uploadingPhoto ? 'Optimizing...' : 'Upload New Photo'}
                        </button>
                        <button
                          type="button"
                          className="btn-remove"
                          onClick={handleRemovePhoto}
                          disabled={uploadingPhoto}
                        >
                          Remove Photo
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`upload-dropzone ${isDragOver ? 'drag-active' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="upload-icon">
                      {uploadingPhoto ? (
                        <div className="upload-spinner" />
                      ) : (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                      )}
                    </div>
                    <h5>{uploadingPhoto ? 'Optimizing Avatar...' : 'Upload Custom Profile Picture'}</h5>
                    <p>{uploadingPhoto ? 'Cropping and compressing to lightweight cloud avatar...' : 'Click or drop a PNG, JPG, or WEBP (Automatically optimized & cloud synced)'}</p>
                    <button type="button" className="browse-btn" disabled={uploadingPhoto}>
                      {uploadingPhoto ? 'Optimizing...' : 'Browse Files'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Fields: Name, Role & Aura Color */}
          <div className="form-fields">
            {/* Display Name */}
            <div className="input-group">
              <label>Display Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                maxLength={40}
              />
            </div>

            {/* Role / Title */}
            <div className="input-group">
              <label>Fintech Title / Role</label>
              <input
                type="text"
                placeholder="e.g. Wealth Builder, Day Trader"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                maxLength={30}
              />
              <div className="chips-row">
                {ROLE_PRESETS.map((presetRole) => (
                  <button
                    key={presetRole}
                    type="button"
                    className={`role-chip ${role === presetRole ? 'active' : ''}`}
                    onClick={() => setRole(presetRole)}
                  >
                    {presetRole}
                  </button>
                ))}
              </div>
            </div>

            {/* Aura Glow Color */}
            <div className="input-group">
              <label>Avatar Aura Ring Glow</label>
              <div className="aura-grid">
                {AURA_COLORS.map((aura) => (
                  <button
                    key={aura.id}
                    type="button"
                    className={`aura-chip ${auraColor === aura.id ? 'active' : ''}`}
                    onClick={() => setAuraColor(aura.id)}
                    style={{
                      boxShadow: auraColor === aura.id ? `0 0 15px ${aura.shadow}` : 'none'
                    }}
                  >
                    <span
                      className="swatch"
                      style={{ background: aura.ringGradient }}
                    />
                    <span>{aura.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <motion.button
              type="button"
              className="save-btn"
              onClick={handleSave}
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: activeAura.ringGradient,
                boxShadow: `0 0 20px ${activeAura.shadow}`
              }}
            >
              {saving ? 'Saving Changes...' : 'Save Profile'}
            </motion.button>
          </div>
        </ModalContent>
      </ModalOverlay>
      )}
    </AnimatePresence>,
    document.body
  );
}

const ModalOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(4, 7, 14, 0.78);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
  padding: 1.5rem;
`;

const ModalContent = styled(motion.div)`
  background: #0d121f;
  border: 1px solid rgba(99, 102, 241, 0.35);
  border-radius: 24px;
  width: 100%;
  max-width: 580px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7);
  padding: 1.6rem;
  display: flex;
  flex-direction: column;
  gap: 1.3rem;
  position: relative;
  z-index: 1000000;
  margin: auto;

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-title {
      display: flex;
      align-items: center;
      gap: 0.6rem;

      .sparkle { font-size: 1.2rem; }

      h3 {
        font-size: 1.2rem;
        font-weight: 800;
        color: #ffffff;
      }
    }

    .close-btn {
      background: none;
      border: none;
      color: var(--text-dim);
      font-size: 1.2rem;
      cursor: pointer;
      transition: color 0.15s ease;

      &:hover { color: #ffffff; }
    }
  }

  /* Live Preview */
  .live-preview-card {
    background: linear-gradient(135deg, rgba(22, 28, 48, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
    padding: 1.2rem;
    display: flex;
    align-items: center;
    gap: 1.2rem;

    .preview-avatar-wrap {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      position: relative;
      flex-shrink: 0;
      transition: all 0.3s ease;

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
      }

      .status-dot {
        position: absolute;
        bottom: 2px;
        right: 2px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid #0d121f;
      }
    }

    .preview-info {
      h4 {
        font-size: 1.15rem;
        font-weight: 800;
        color: #ffffff;
        margin-bottom: 0.35rem;
      }

      .preview-badges {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        flex-wrap: wrap;

        .role-pill {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.15rem 0.55rem;
          border-radius: 999px;
          border: 1px solid transparent;
        }

        .email-text {
          font-size: 0.76rem;
          color: var(--text-dim);
        }
      }
    }
  }

  /* Tabs Bar */
  .tabs-bar {
    display: flex;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.03);
    padding: 0.3rem;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.06);

    .tab-btn {
      flex: 1;
      padding: 0.5rem;
      background: none;
      border: none;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text-dim);
      cursor: pointer;
      transition: all 0.2s ease;

      &.active {
        background: rgba(99, 102, 241, 0.2);
        color: #ffffff;
        border: 1px solid rgba(99, 102, 241, 0.35);
      }
    }
  }

  /* Gallery Grid */
  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;

    .preset-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1.5px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 0.75rem 0.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.45rem;
      cursor: pointer;
      position: relative;
      transition: all 0.2s ease;

      img {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        object-fit: cover;
      }

      .preset-name {
        font-size: 0.68rem;
        color: #cbd5e1;
        font-weight: 600;
        text-align: center;
      }

      .check-badge {
        position: absolute;
        top: 6px;
        right: 6px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        color: #ffffff;
        font-size: 0.65rem;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.06);
      }
    }
  }

  /* Active Custom Photo Card */
  .custom-photo-card {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: 1.2rem 1.5rem;
    border-radius: 16px;
    background: rgba(99, 102, 241, 0.05);
    border: 1px solid rgba(99, 102, 241, 0.25);

    .photo-preview-ring {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      border: 2px solid #818cf8;
      overflow: hidden;
      flex-shrink: 0;
      background: #0f172a;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .photo-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;

      .photo-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.85rem;
        font-weight: 700;
        color: #ffffff;

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
      }

      .photo-meta {
        font-size: 0.76rem;
        color: var(--text-dim);
      }

      .photo-actions {
        display: flex;
        gap: 0.6rem;
        margin-top: 0.4rem;

        .btn-replace {
          background: rgba(99, 102, 241, 0.2);
          border: 1px solid rgba(99, 102, 241, 0.4);
          color: #818cf8;
          font-size: 0.74rem;
          font-weight: 600;
          padding: 0.3rem 0.8rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover:not(:disabled) {
            background: rgba(99, 102, 241, 0.3);
            border-color: #818cf8;
          }
        }

        .btn-remove {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: #f87171;
          font-size: 0.74rem;
          font-weight: 600;
          padding: 0.3rem 0.8rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover:not(:disabled) {
            background: rgba(239, 68, 68, 0.22);
            border-color: #f87171;
          }
        }
      }
    }
  }

  /* Upload Dropzone */
  .upload-dropzone {
    border: 2px dashed rgba(99, 102, 241, 0.4);
    background: rgba(99, 102, 241, 0.04);
    border-radius: 16px;
    padding: 2rem 1.5rem;
    text-align: center;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    transition: all 0.2s ease;

    &.drag-active, &:hover {
      background: rgba(99, 102, 241, 0.1);
      border-color: #818cf8;
      box-shadow: 0 0 20px rgba(99, 102, 241, 0.15);
    }

    .upload-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: rgba(99, 102, 241, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;

      .upload-spinner {
        width: 24px;
        height: 24px;
        border: 2.5px solid rgba(99, 102, 241, 0.3);
        border-top-color: #818cf8;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    h5 {
      font-size: 0.95rem;
      font-weight: 700;
      color: #ffffff;
    }

    p {
      font-size: 0.78rem;
      color: var(--text-dim);
    }

    .browse-btn {
      margin-top: 0.4rem;
      padding: 0.4rem 1rem;
      border-radius: 999px;
      background: rgba(99, 102, 241, 0.2);
      border: 1px solid rgba(99, 102, 241, 0.35);
      color: #818cf8;
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        background: rgba(99, 102, 241, 0.3);
      }
    }
  }

  /* Form Fields */
  .form-fields {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;

      label {
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--text-dim);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      input {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        padding: 0.65rem 0.9rem;
        color: #ffffff;
        font-size: 0.88rem;
        outline: none;
        transition: border-color 0.2s ease;

        &:focus {
          border-color: #818cf8;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.2);
        }
      }

      .chips-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
        margin-top: 0.3rem;

        .role-chip {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #cbd5e1;
          font-size: 0.72rem;
          padding: 0.25rem 0.6rem;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.15s ease;

          &.active {
            background: rgba(99, 102, 241, 0.25);
            border-color: #818cf8;
            color: #ffffff;
            font-weight: 700;
          }

          &:hover:not(.active) {
            background: rgba(255, 255, 255, 0.08);
          }
        }
      }

      .aura-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: 0.5rem;
        margin-top: 0.3rem;

        .aura-chip {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0.4rem 0.65rem;
          border-radius: 10px;
          color: #cbd5e1;
          font-size: 0.76rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;

          .swatch {
            width: 14px;
            height: 14px;
            border-radius: 50%;
            flex-shrink: 0;
          }

          &.active {
            border-color: #ffffff;
            color: #ffffff;
            background: rgba(255, 255, 255, 0.08);
          }
        }
      }
    }
  }

  /* Modal Footer */
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding-top: 0.6rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);

    .cancel-btn {
      background: none;
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #94a3b8;
      padding: 0.55rem 1.2rem;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;

      &:hover {
        color: #ffffff;
        border-color: rgba(255, 255, 255, 0.2);
      }
    }

    .save-btn {
      border: none;
      color: #ffffff;
      padding: 0.55rem 1.4rem;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }

  @media (max-width: 600px) {
    padding: 1.1rem;
    border-radius: 18px;
    gap: 1rem;

    .gallery-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
    }

    .custom-photo-card {
      padding: 0.9rem;
      gap: 0.85rem;

      .photo-preview-ring {
        width: 56px;
        height: 56px;
      }
    }
  }

  @media (max-width: 420px) {
    .gallery-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
`;

export default ProfileModal;
