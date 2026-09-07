'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/auth';
import styles from './BagPage.module.scss';

interface Club {
  id: string;
  category: string;
  brand: string;
  model: string;
  loft?: string;
  shaft?: string;
  flex?: string;
  notes?: string;
  active: boolean;
}

const DEFAULT_CLUBS: Club[] = [
  { id: 'driver', category: 'Driver', brand: 'Titleist', model: 'TSR2', loft: '9.0°', shaft: 'Diamana S+', flex: 'X', notes: 'Primary driver', active: true },
  { id: '3w', category: '3 Wood', brand: 'Titleist', model: 'TSR2', loft: '15.0°', shaft: 'Diamana S+', flex: 'X', notes: '', active: true },
  { id: '5w', category: '5 Wood', brand: 'Callaway', model: 'Paradym', loft: '18.0°', shaft: 'Mitsubishi Diamana S+', flex: 'X', notes: '', active: true },
  { id: '3h', category: '3 Hybrid', brand: 'Titleist', model: 'TSR Hybrid', loft: '19.0°', shaft: 'Diamana S+', flex: 'X', notes: '', active: true },
  { id: '4i', category: '4 Iron', brand: 'Titleist', model: 'T200', loft: '20.5°', shaft: 'Nippon N.S. Pro Modus3', flex: 'X', notes: '', active: true },
  { id: '5i', category: '5 Iron', brand: 'Titleist', model: 'T200', loft: '22.0°', shaft: 'Nippon N.S. Pro Modus3', flex: 'X', notes: '', active: true },
  { id: '6i', category: '6 Iron', brand: 'Titleist', model: 'T200', loft: '24.0°', shaft: 'Nippon N.S. Pro Modus3', flex: 'X', notes: '', active: true },
  { id: '7i', category: '7 Iron', brand: 'Titleist', model: 'T200', loft: '26.0°', shaft: 'Nippon N.S. Pro Modus3', flex: 'X', notes: '', active: true },
  { id: '8i', category: '8 Iron', brand: 'Titleist', model: 'T200', loft: '28.0°', shaft: 'Nippon N.S. Pro Modus3', flex: 'X', notes: '', active: true },
  { id: '9i', category: '9 Iron', brand: 'Titleist', model: 'T200', loft: '31.0°', shaft: 'Nippon N.S. Pro Modus3', flex: 'X', notes: '', active: true },
  { id: 'pw', category: 'Pitching Wedge', brand: 'Titleist', model: 'Vokey Design SM10', loft: '46.0°', shaft: 'Nippon N.S. Pro Modus3', flex: 'X', notes: '', active: true },
  { id: 'gw', category: 'Gap Wedge', brand: 'Titleist', model: 'Vokey Design SM10', loft: '50.0°', shaft: 'Dynamic Gold S200', flex: 'X', notes: '', active: true },
  { id: 'sw', category: 'Sand Wedge', brand: 'Titleist', model: 'Vokey Design SM10', loft: '56.0°', shaft: 'Dynamic Gold S200', flex: 'X', notes: '', active: true },
  { id: 'lw', category: 'Lob Wedge', brand: 'Titleist', model: 'Vokey Design SM10', loft: '60.0°', shaft: 'Dynamic Gold S200', flex: 'X', notes: '', active: true },
  { id: 'putter', category: 'Putter', brand: 'Titleist', model: 'Scotty Cameron Select', loft: '-', shaft: 'Lamkin Crossline', flex: 'N/A', notes: 'Spider S shape, 34"', active: true },
];

export default function BagPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const user = getCurrentUser();

  useEffect(() => {
    // Load from localStorage or use defaults
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`bag-${user?.id}`);
      if (saved) {
        setClubs(JSON.parse(saved));
      } else {
        setClubs(DEFAULT_CLUBS);
      }
    }
  }, [user?.id]);

  const handleSave = (club: Club) => {
    if (editingClub) {
      setClubs(clubs.map(c => (c.id === club.id ? club : c)));
    } else {
      setClubs([...clubs, { ...club, id: Date.now().toString() }]);
    }
    setEditingClub(null);
    setIsEditing(false);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`bag-${user?.id}`, JSON.stringify(clubs));
    }
  };

  const handleDelete = (id: string) => {
    setClubs(clubs.filter(c => c.id !== id));
  };

  const handleToggleActive = (id: string) => {
    setClubs(clubs.map(c => (c.id === id ? { ...c, active: !c.active } : c)));
  };

  const activeClubs = clubs.filter(c => c.active).length;
  const totalClubs = clubs.length;

  return (
    <div className={styles['page']}>
      <div className={styles['page__header']}>
        <h1 className={styles['page__title']}>What's in the Bag</h1>
        <p className={styles['page__subtitle']}>
          {user?.name}'s Golf Equipment ({activeClubs}/{totalClubs} clubs in play)
        </p>
      </div>

      <div className={styles['page__container']}>
        <button
          className={styles['page__add-button']}
          onClick={() => {
            setEditingClub(null);
            setIsEditing(true);
          }}
        >
          + ADD CLUB
        </button>

        {isEditing && (
          <ClubForm
            club={editingClub}
            onSave={handleSave}
            onCancel={() => {
              setIsEditing(false);
              setEditingClub(null);
            }}
          />
        )}

        <div className={styles['page__clubs']}>
          {clubs.map(club => (
            <div
              key={club.id}
              className={`${styles['page__club']} ${
                !club.active ? styles['page__club--inactive'] : ''
              }`}
            >
              <div className={styles['page__club-header']}>
                <div>
                  <h3 className={styles['page__club-category']}>{club.category}</h3>
                  <p className={styles['page__club-specs']}>
                    {club.brand} {club.model}
                  </p>
                </div>
                <div className={styles['page__club-actions']}>
                  <button
                    className={styles['page__toggle']}
                    onClick={() => handleToggleActive(club.id)}
                    title={club.active ? 'Deactivate' : 'Activate'}
                  >
                    {club.active ? '✓' : '○'}
                  </button>
                  <button
                    className={styles['page__edit']}
                    onClick={() => {
                      setEditingClub(club);
                      setIsEditing(true);
                    }}
                  >
                    ✎
                  </button>
                  <button
                    className={styles['page__delete']}
                    onClick={() => handleDelete(club.id)}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {(club.loft || club.shaft || club.flex || club.notes) && (
                <div className={styles['page__club-details']}>
                  {club.loft && <span className={styles['page__detail']}>Loft: {club.loft}</span>}
                  {club.shaft && <span className={styles['page__detail']}>Shaft: {club.shaft}</span>}
                  {club.flex && <span className={styles['page__detail']}>Flex: {club.flex}</span>}
                  {club.notes && <span className={styles['page__detail-note']}>{club.notes}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ClubForm({
  club,
  onSave,
  onCancel,
}: {
  club: Club | null;
  onSave: (club: Club) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Club>(
    club || {
      id: '',
      category: '',
      brand: '',
      model: '',
      loft: '',
      shaft: '',
      flex: '',
      notes: '',
      active: true,
    }
  );

  return (
    <div className={styles['page__form']}>
      <h2>Add/Edit Club</h2>
      <div className={styles['page__form-grid']}>
        <input
          type="text"
          placeholder="Club Category (e.g., Driver, 7 Iron)"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className={styles['page__input']}
        />
        <input
          type="text"
          placeholder="Brand"
          value={formData.brand}
          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
          className={styles['page__input']}
        />
        <input
          type="text"
          placeholder="Model"
          value={formData.model}
          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
          className={styles['page__input']}
        />
        <input
          type="text"
          placeholder="Loft (e.g., 9.0°)"
          value={formData.loft || ''}
          onChange={(e) => setFormData({ ...formData, loft: e.target.value })}
          className={styles['page__input']}
        />
        <input
          type="text"
          placeholder="Shaft"
          value={formData.shaft || ''}
          onChange={(e) => setFormData({ ...formData, shaft: e.target.value })}
          className={styles['page__input']}
        />
        <input
          type="text"
          placeholder="Flex (X, S, R, A)"
          value={formData.flex || ''}
          onChange={(e) => setFormData({ ...formData, flex: e.target.value })}
          className={styles['page__input']}
        />
        <textarea
          placeholder="Notes"
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className={styles['page__input']}
        />
      </div>

      <div className={styles['page__form-actions']}>
        <button
          className={styles['page__cancel']}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className={styles['page__save']}
          onClick={() => onSave(formData)}
        >
          Save Club
        </button>
      </div>
    </div>
  );
}
