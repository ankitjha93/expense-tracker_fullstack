import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import avatar from '../../img/avatar.png'
import { menuItems } from '../../utils/menuItems'
import { signout } from '../../utils/Icons'
import { useAuth } from '../../context/authContext'
import { useToast } from '../../context/toastContext'
import { useGlobalContext } from '../../context/globalContext'
import ProfileModal from '../Profile/ProfileModal'
import { AURA_COLORS } from '../Profile/avatarPresets'
import InteractiveBrand from '../Brand/InteractiveBrand'

function Navigation({ active, setActive }) {
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  const { incomes, expenses, budgets } = useGlobalContext()

  const displayName = user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'Fintech User')
  const displayEmail = user?.email || 'Active Account'
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileMenuOpen])

  const cachedProfile = (() => {
    try {
      if (user?.id) {
        const userCache = localStorage.getItem(`user_custom_profile_${user.id}`)
        if (userCache) return JSON.parse(userCache)
      }
      return JSON.parse(localStorage.getItem('user_custom_profile')) || {}
    } catch {
      return {}
    }
  })()

  const activeAvatar = user?.user_metadata?.avatar_url || cachedProfile.avatar_url || avatar
  const activeRole = user?.user_metadata?.role || cachedProfile.role || 'Wealth Builder'
  const activeAuraId = user?.user_metadata?.aura_color || cachedProfile.aura_color || 'emerald'
  const currentAura = AURA_COLORS.find(a => a.id === activeAuraId) || AURA_COLORS[0]

  const activeMenuItem = menuItems.find(item => item.id === active) || menuItems[0]

  const getBadgeCount = (id) => {
    if (id === 2) return (incomes?.length || 0) + (expenses?.length || 0)
    if (id === 3) return incomes?.length || 0
    if (id === 4) return expenses?.length || 0
    if (id === 5) return budgets?.length || 0
    if (id === 6) return 'AI'
    return null
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setMobileMenuOpen(false)
      toast.info('You have been signed out. See you soon!', 'Signed Out')
    } catch (err) {
      console.error('Sign out error:', err)
      toast.error('Failed to sign out', 'Error')
    }
  }

  const renderNavList = (isMobile = false) => (
    <ul className='menu-items'>
      {menuItems.map((item) => {
        const isActive = active === item.id;
        const count = getBadgeCount(item.id);
        return (
          <motion.li
            key={item.id}
            onClick={() => {
              setActive(item.id);
              if (isMobile) setMobileMenuOpen(false);
            }}
            className={isActive ? 'active' : ''}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          >
            {isActive && (
              <motion.div
                layoutId={isMobile ? 'mobileActiveNavPill' : 'activeNavPill'}
                className='active-pill'
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className='icon-wrap'>{item.icon}</span>
            <span className='menu-title'>{item.title}</span>
            {count !== null && (
              <span className={`count-badge ${item.id === 6 ? 'ai-badge' : ''}`}>{count}</span>
            )}
          </motion.li>
        )
      })}
    </ul>
  )

  const renderProfileSection = () => (
    <div className='bottom-profile'>
      <div
        className='user-badge'
        onClick={() => {
          setShowProfileModal(true);
          setMobileMenuOpen(false);
        }}
        title='Click to customize your profile & avatar'
      >
        <div
          className='avatar-wrap'
          style={{
            boxShadow: `0 0 14px ${currentAura.shadow}`,
            borderColor: currentAura.color
          }}
        >
          <img src={activeAvatar} alt='User Avatar' />
          <div className='avatar-hover-overlay'>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
          </div>
          <span
            className='status-dot'
            style={{ background: currentAura.color, boxShadow: `0 0 6px ${currentAura.color}` }}
          />
        </div>
        <div className='user-info'>
          <h4 title={`${displayName} (${displayEmail})`}>{displayName}</h4>
          <span
            className='role-tag'
            style={{
              background: `${currentAura.color}15`,
              color: currentAura.color,
              borderColor: `${currentAura.color}40`
            }}
          >
            {activeRole}
          </span>
        </div>
        <button
          type='button'
          className='edit-trigger-btn'
          title='Edit Profile & Avatar'
          onClick={(e) => {
            e.stopPropagation();
            setShowProfileModal(true);
            setMobileMenuOpen(false);
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
        </button>
      </div>

      <motion.button
        type='button'
        className='signout-btn'
        onClick={handleSignOut}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {signout}
        <span>Sign Out</span>
      </motion.button>
    </div>
  )

  return (
    <>
      {/* Desktop Fixed Sidebar (>1024px) */}
      <NavStyled className='desktop-sidebar'>
        <div className='brand-header'>
          <InteractiveBrand size="md" />
        </div>

        {renderNavList(false)}
        {renderProfileSection()}
      </NavStyled>

      {/* Mobile Top Header (<=1024px) */}
      <MobileTopHeader className='mobile-top-bar'>
        <div className='brand-slot'>
          <InteractiveBrand size="sm" showBadge={false} />
        </div>

        <div className='mobile-actions'>
          {/* Active View Indicator Chip */}
          <div className='active-view-chip' onClick={() => setMobileMenuOpen(true)}>
            <span className='chip-icon'>{activeMenuItem.icon}</span>
            <span className='chip-title'>{activeMenuItem.title}</span>
          </div>

          {/* Quick Profile Avatar */}
          <div
            className='mobile-avatar-trigger'
            style={{
              borderColor: currentAura.color,
              boxShadow: `0 0 10px ${currentAura.shadow}`
            }}
            onClick={() => setShowProfileModal(true)}
            title='Customize Profile'
          >
            <img src={activeAvatar} alt='User Avatar' />
            <span
              className='mobile-dot'
              style={{ background: currentAura.color }}
            />
          </div>

          {/* Animated Hamburger Button */}
          <motion.button
            type='button'
            className='hamburger-btn'
            onClick={() => setMobileMenuOpen(prev => !prev)}
            whileTap={{ scale: 0.9 }}
            aria-label='Toggle Navigation Menu'
          >
            <span className={`bar ${mobileMenuOpen ? 'open' : ''}`} />
            <span className={`bar ${mobileMenuOpen ? 'open' : ''}`} />
            <span className={`bar ${mobileMenuOpen ? 'open' : ''}`} />
          </motion.button>
        </div>
      </MobileTopHeader>

      {/* Mobile Offcanvas Slide-Out Drawer (<=1024px) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <MobileDrawerOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <MobileDrawerPanel
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className='drawer-top'>
                <InteractiveBrand size="sm" />
                <button
                  type='button'
                  className='drawer-close-btn'
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label='Close Menu'
                >
                  ✕
                </button>
              </div>

              <div className='drawer-body'>
                {renderNavList(true)}
              </div>

              <div className='drawer-footer'>
                {renderProfileSection()}
              </div>
            </MobileDrawerPanel>
          </MobileDrawerOverlay>
        )}
      </AnimatePresence>

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  )
}

// Desktop Sidebar Styling
const NavStyled = styled.nav`
  padding: 1.8rem 1.4rem;
  width: 280px;
  height: 100%;
  background: rgba(14, 19, 31, 0.85);
  border: 1px solid var(--border-subtle);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 28px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
  flex-shrink: 0;

  .brand-header {
    display: flex;
    align-items: center;
    padding: 0.2rem 0.2rem 1rem 0.2rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .menu-items {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.5rem;

    li {
      position: relative;
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      border-radius: 14px;
      font-weight: 500;
      font-size: 0.95rem;
      color: var(--text-muted);
      cursor: pointer;
      transition: color 0.2s ease;
      z-index: 1;

      .icon-wrap {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.15rem;
        color: inherit;
        z-index: 2;
      }

      .menu-title {
        z-index: 2;
      }

      .count-badge {
        margin-left: auto;
        font-size: 0.72rem;
        font-weight: 600;
        padding: 0.15rem 0.55rem;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--text-muted);
        z-index: 2;
        letter-spacing: 0.3px;
        transition: all 0.2s ease;

        &.ai-badge {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(168, 85, 247, 0.3) 100%);
          border: 1px solid rgba(168, 85, 247, 0.5);
          color: #c084fc;
          font-weight: 700;
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.25);
        }
      }

      &:hover {
        color: #ffffff;

        .count-badge {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }
      }

      &.active {
        color: #ffffff;
        font-weight: 600;

        .icon-wrap {
          color: var(--accent-violet-light);
        }

        .count-badge {
          background: rgba(99, 102, 241, 0.25);
          border-color: rgba(99, 102, 241, 0.4);
          color: #c7d2fe;
        }
      }

      .active-pill {
        position: absolute;
        inset: 0;
        background: rgba(99, 102, 241, 0.16);
        border: 1px solid rgba(99, 102, 241, 0.35);
        border-radius: 14px;
        box-shadow: 0 0 20px rgba(99, 102, 241, 0.15);
        z-index: 1;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 25%;
          bottom: 25%;
          width: 3.5px;
          border-radius: 0 4px 4px 0;
          background: var(--accent-violet);
          box-shadow: 0 0 10px var(--accent-violet);
        }
      }
    }
  }

  .bottom-profile {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);

    .user-badge {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      padding: 0.65rem 0.8rem;
      border-radius: 16px;
      cursor: pointer;
      position: relative;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.06);
        border-color: rgba(99, 102, 241, 0.3);

        .avatar-wrap .avatar-hover-overlay {
          opacity: 1;
        }

        .edit-trigger-btn {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.1);
        }
      }

      .avatar-wrap {
        position: relative;
        width: 42px;
        height: 42px;
        border-radius: 50%;
        border: 2px solid transparent;
        transition: all 0.25s ease;
        flex-shrink: 0;

        img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        .avatar-hover-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .status-dot {
          position: absolute;
          bottom: 0px;
          right: 0px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 2px solid #0e131f;
        }
      }

      .user-info {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        gap: 0.15rem;

        h4 {
          font-size: 0.9rem;
          font-weight: 700;
          color: #ffffff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .role-tag {
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding: 0.1rem 0.45rem;
          border-radius: 999px;
          border: 1px solid transparent;
          align-self: flex-start;
          white-space: nowrap;
        }
      }

      .edit-trigger-btn {
        background: none;
        border: none;
        color: var(--text-dim);
        padding: 0.3rem;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;

        &:hover {
          color: #ffffff;
        }
      }
    }

    .signout-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      width: 100%;
      padding: 0.65rem;
      background: rgba(244, 63, 94, 0.08);
      border: 1px solid rgba(244, 63, 94, 0.2);
      border-radius: 12px;
      color: #fda4af;
      font-family: inherit;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(244, 63, 94, 0.18);
        border-color: rgba(244, 63, 94, 0.4);
        color: #ffffff;
        box-shadow: 0 0 15px rgba(244, 63, 94, 0.2);
      }
    }
  }

  @media (max-width: 1024px) {
    display: none !important;
  }
`;

// Mobile Top Bar Header
const MobileTopHeader = styled.header`
  display: none;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: rgba(14, 19, 31, 0.88);
  border: 1px solid var(--border-subtle);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  flex-shrink: 0;

  @media (max-width: 1024px) {
    display: flex;
  }

  @media (max-width: 480px) {
    padding: 0.6rem 0.85rem;
    border-radius: 16px;
  }

  .mobile-actions {
    display: flex;
    align-items: center;
    gap: 0.65rem;

    @media (max-width: 480px) {
      gap: 0.45rem;
    }

    .active-view-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      background: rgba(99, 102, 241, 0.12);
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: #c7d2fe;
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;

      @media (max-width: 540px) {
        display: none;
      }
    }

    .mobile-avatar-trigger {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      border: 2px solid #10b981;
      position: relative;
      cursor: pointer;
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
      }

      .mobile-dot {
        position: absolute;
        bottom: 0px;
        right: 0px;
        width: 9px;
        height: 9px;
        border-radius: 50%;
        border: 2px solid #0e131f;
      }
    }

    .hamburger-btn {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 5px;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(99, 102, 241, 0.18);
        border-color: rgba(99, 102, 241, 0.4);
      }

      .bar {
        width: 18px;
        height: 2px;
        border-radius: 2px;
        background: #ffffff;
        transition: transform 0.25s ease, opacity 0.2s ease;

        &.open:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }
        &.open:nth-child(2) {
          opacity: 0;
        }
        &.open:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }
      }
    }
  }
`;

// Offcanvas Slide-Out Drawer Overlay
const MobileDrawerOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 999999;
  display: flex;
  justify-content: flex-end;
`;

const MobileDrawerPanel = styled(motion.div)`
  width: 85%;
  max-width: 320px;
  height: 100%;
  background: #0d121f;
  border-left: 1px solid rgba(99, 102, 241, 0.3);
  padding: 1.5rem 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: -15px 0 40px rgba(0, 0, 0, 0.7);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  .drawer-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 1.2rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);

    .drawer-close-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #ffffff;
      font-size: 1.1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(244, 63, 94, 0.2);
        color: #fb7185;
      }
    }
  }

  .drawer-body {
    flex: 1;
    margin: 1.2rem 0;

    .menu-items {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      li {
        position: relative;
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.8rem 1rem;
        border-radius: 14px;
        font-weight: 500;
        font-size: 0.95rem;
        color: var(--text-muted);
        cursor: pointer;
        transition: color 0.2s ease;
        z-index: 1;

        .icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.15rem;
          color: inherit;
          z-index: 2;
        }

        .menu-title {
          z-index: 2;
        }

        .count-badge {
          margin-left: auto;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 0.15rem 0.55rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-muted);
          z-index: 2;

          &.ai-badge {
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(168, 85, 247, 0.3) 100%);
            border: 1px solid rgba(168, 85, 247, 0.5);
            color: #c084fc;
            font-weight: 700;
          }
        }

        &:hover, &.active {
          color: #ffffff;
        }

        &.active {
          .icon-wrap {
            color: var(--accent-violet-light);
          }
          .count-badge {
            background: rgba(99, 102, 241, 0.25);
            border-color: rgba(99, 102, 241, 0.4);
            color: #c7d2fe;
          }
        }

        .active-pill {
          position: absolute;
          inset: 0;
          background: rgba(99, 102, 241, 0.18);
          border: 1px solid rgba(99, 102, 241, 0.4);
          border-radius: 14px;
          z-index: 1;
        }
      }
    }
  }

  .drawer-footer {
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);

    .bottom-profile {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;

      .user-badge {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        padding: 0.65rem 0.8rem;
        border-radius: 16px;
        cursor: pointer;

        .avatar-wrap {
          position: relative;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 2px solid transparent;
          flex-shrink: 0;

          img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
          }

          .status-dot {
            position: absolute;
            bottom: 0px;
            right: 0px;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            border: 2px solid #0e131f;
          }
        }

        .user-info {
          flex: 1;
          overflow: hidden;

          h4 {
            font-size: 0.9rem;
            font-weight: 700;
            color: #ffffff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .role-tag {
            font-size: 0.65rem;
            font-weight: 700;
            text-transform: uppercase;
            padding: 0.1rem 0.45rem;
            border-radius: 999px;
            display: inline-block;
          }
        }

        .edit-trigger-btn {
          background: none;
          border: none;
          color: var(--text-dim);
          padding: 0.3rem;
          cursor: pointer;
        }
      }

      .signout-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.6rem;
        width: 100%;
        padding: 0.75rem;
        background: rgba(244, 63, 94, 0.1);
        border: 1px solid rgba(244, 63, 94, 0.25);
        border-radius: 12px;
        color: #fda4af;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
      }
    }
  }
`;

export default Navigation