import { useState, useEffect, useCallback } from 'react';
import { hospitalService } from '../services/hospital.service';
import {
    Globe,
    Mail,
    Phone,
    MapPin,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Key,
    Copy,
    Check,
    RefreshCw,
    ArrowLeft,
    Plus,
    Building2
} from 'lucide-react';

const INITIAL_FORM_STATE = {
    name: '',
    websiteUrl: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
};

const COMMON_TIMEZONES = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Dubai',
    'Asia/Kolkata',
    'Asia/Singapore',
    'Asia/Tokyo',
    'Australia/Sydney'
];

export default function Hospital() {
    const [hospitals, setHospitals] = useState([]);
    const [nextCursor, setNextCursor] = useState(null);
    const [isFetchingList, setIsFetchingList] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [fetchError, setFetchError] = useState(null);

    // View mode: 'list' or 'create'
    const [activeView, setActiveView] = useState('list');

    // Form states
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [createdHospital, setCreatedHospital] = useState(null);
    const [copiedKey, setCopiedKey] = useState(null);

    // Fetch user's hospitals (initial load / refresh)
    const fetchHospitals = useCallback(async () => {
        setIsFetchingList(true);
        setFetchError(null);
        try {
            const result = await hospitalService.getHospitals();
            setHospitals(result.data);
            setNextCursor(result.nextCursor);
        } catch (err) {
            if (err.response?.status === 404) {
                setHospitals([]);
                setNextCursor(null);
            } else {
                setFetchError(err.response?.data?.message || 'Failed to load your hospitals.');
            }
        } finally {
            setIsFetchingList(false);
        }
    }, []);

    // Append next page
    const loadMore = useCallback(async () => {
        if (!nextCursor || isLoadingMore) return;
        setIsLoadingMore(true);
        try {
            const result = await hospitalService.getHospitals({ cursor: nextCursor });
            setHospitals(prev => [...prev, ...result.data]);
            setNextCursor(result.nextCursor);
        } catch (err) {
            console.error('Error loading more hospitals:', err);
        } finally {
            setIsLoadingMore(false);
        }
    }, [nextCursor, isLoadingMore]);

    useEffect(() => {
        fetchHospitals();
    }, [fetchHospitals]);

    const handleCopyKey = (key) => {
        navigator.clipboard.writeText(key);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (submitError) setSubmitError(null);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setSubmitError(null);
        setIsSubmitting(true);

        const payload = {
            name: formData.name.trim(),
            website: {
                url: formData.websiteUrl.trim()
            }
        };

        const contact = {};
        if (formData.email.trim()) contact.email = formData.email.trim();
        if (formData.phone.trim()) contact.phone = formData.phone.trim();
        if (Object.keys(contact).length > 0) payload.contact = contact;

        const address = {};
        if (formData.street.trim()) address.street = formData.street.trim();
        if (formData.city.trim()) address.city = formData.city.trim();
        if (formData.state.trim()) address.state = formData.state.trim();
        if (formData.country.trim()) address.country = formData.country.trim();
        if (formData.postalCode.trim()) address.postalCode = formData.postalCode.trim();
        if (Object.keys(address).length > 0) payload.address = address;

        if (formData.timezone.trim()) payload.timezone = formData.timezone.trim();

        try {
            const result = await hospitalService.createHospital(payload);
            setCreatedHospital(result);
            setFormData(INITIAL_FORM_STATE);
            fetchHospitals();
        } catch (err) {
            console.error('Failed to create hospital:', err);
            const message =
                err.response?.data?.message ||
                (err.response?.data?.errors && err.response.data.errors[0]?.message) ||
                'Failed to create hospital. Please check the details and try again.';
            setSubmitError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="hosp-page page-enter">
            {/* ── Page Header ── */}
            <div className="hosp-header">
                <div className="hosp-header-left">
                    <h1 className="hosp-title">Hospital management</h1>
                    <p className="hosp-subtitle">Registered organizations</p>
                </div>

                <div className="hosp-header-actions">
                    {activeView === 'create' ? (
                        <button
                            className="hosp-btn-secondary"
                            onClick={() => {
                                setActiveView('list');
                                setCreatedHospital(null);
                                setSubmitError(null);
                            }}
                        >
                            <ArrowLeft size={14} />
                            Back
                        </button>
                    ) : (
                        <button
                            className="hosp-btn-primary"
                            onClick={() => {
                                setActiveView('create');
                                setCreatedHospital(null);
                            }}
                        >
                            Create hospital
                        </button>
                    )}
                </div>
            </div>

            {/* ── LIST VIEW ── */}
            {activeView === 'list' && (
                <div className="hosp-list">
                    {/* Error */}
                    {fetchError && (
                        <div className="hosp-alert hosp-alert-error">
                            <AlertCircle size={16} />
                            <span>{fetchError}</span>
                            <button onClick={fetchHospitals} className="hosp-alert-action">Try Again</button>
                        </div>
                    )}

                    {/* Loading skeletons */}
                    {isFetchingList && (
                        <div className="hosp-skeleton-list">
                            {[1, 2].map(i => (
                                <div key={i} className="hosp-card hosp-skeleton">
                                    <div className="hosp-skeleton-line" style={{ width: '45%', height: 16 }} />
                                    <div className="hosp-skeleton-line" style={{ width: '30%', height: 12, marginTop: 6 }} />
                                    <div className="hosp-skeleton-line" style={{ width: '100%', height: 36, marginTop: 14 }} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty state */}
                    {!isFetchingList && hospitals.length === 0 && !fetchError && (
                        <div className="hosp-empty">
                            <div className="hosp-empty-icon">
                                <Building2 size={28} />
                            </div>
                            <h3 className="hosp-empty-title">No hospitals registered yet</h3>
                            <p className="hosp-empty-desc">Register your first hospital organization to start provisioning AI healthcare agents.</p>
                            <button
                                className="hosp-btn-primary"
                                onClick={() => setActiveView('create')}
                            >
                                <Plus size={14} />
                                Create Your First Hospital
                            </button>
                        </div>
                    )}

                    {/* Hospital list */}
                    {!isFetchingList && hospitals.length > 0 && (
                        <div className="hosp-card-list">
                            {hospitals.map((hospital) => (
                                <div
                                    key={hospital._id || hospital.slug || hospital.name}
                                    className="hosp-card card-enter"
                                >
                                    <div className="hosp-card-content">
                                        {/* Card header */}
                                        <div className="hosp-card-header">
                                            <h3 className="hosp-card-name">{hospital.name}</h3>
                                            <span className="hosp-badge-active">Active</span>
                                        </div>

                                        {/* Subtitle / slug */}
                                        <div className="hosp-card-slug">
                                            {hospital.slug || hospital.website?.url || 'south-city-hospital'}
                                        </div>

                                        {/* Public Key Row */}
                                        <div className="hosp-key-box">
                                            <span className="hosp-key-value">
                                                {hospital.publicKey || 'Public API key'}
                                            </span>
                                            {hospital.publicKey && (
                                                <button
                                                    onClick={() => handleCopyKey(hospital.publicKey)}
                                                    className="hosp-copy-btn"
                                                    title="Copy public API key"
                                                >
                                                    {copiedKey === hospital.publicKey
                                                        ? <Check size={13} style={{ color: '#20C997' }} />
                                                        : <Copy size={13} />
                                                    }
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Load More */}
                    {!isFetchingList && nextCursor && (
                        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12 }}>
                            <button
                                onClick={loadMore}
                                disabled={isLoadingMore}
                                className="hosp-btn-secondary"
                            >
                                {isLoadingMore
                                    ? <><Loader2 size={14} className="spin" />Loading...</>
                                    : 'Load More'
                                }
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ── CREATE VIEW ── */}
            {activeView === 'create' && (
                <div className="hosp-form-section">
                    {/* Success */}
                    {createdHospital && (
                        <div className="hosp-alert hosp-alert-success">
                            <CheckCircle2 size={16} />
                            <div style={{ flex: 1 }}>
                                <strong>{createdHospital.name}</strong> has been registered successfully.
                                {createdHospital.publicKey && (
                                    <div className="hosp-key-row" style={{ marginTop: 10 }}>
                                        <span className="hosp-key-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Key size={11} />Public Key</span>
                                        <div className="hosp-key-value-row">
                                            <span className="hosp-key-value">{createdHospital.publicKey}</span>
                                            <button onClick={() => handleCopyKey(createdHospital.publicKey)} className="hosp-copy-btn">
                                                {copiedKey === createdHospital.publicKey ? <Check size={13} /> : <Copy size={13} />}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button onClick={() => setActiveView('list')} className="hosp-alert-action">View All</button>
                        </div>
                    )}

                    {/* Error */}
                    {submitError && (
                        <div className="hosp-alert hosp-alert-error">
                            <AlertCircle size={16} />
                            <span>{submitError}</span>
                        </div>
                    )}

                    <form onSubmit={handleFormSubmit} className="hosp-form">
                        {/* Basic Info */}
                        <div className="hosp-form-section-inner">
                            <h2 className="hosp-form-section-title">Basic Information</h2>
                            <div className="hosp-form-grid-2">
                                <div className="hosp-field">
                                    <label className="hosp-label">Hospital Name <span className="req">*</span></label>
                                    <input
                                        type="text" name="name" required maxLength={150}
                                        placeholder="e.g. City General Hospital"
                                        value={formData.name} onChange={handleFormChange}
                                        className="hosp-input"
                                    />
                                </div>
                                <div className="hosp-field">
                                    <label className="hosp-label">Website URL <span className="req">*</span></label>
                                    <div className="hosp-input-icon-wrap">
                                        <Globe size={14} className="hosp-input-icon" />
                                        <input
                                            type="url" name="websiteUrl" required
                                            placeholder="https://hospital.example.com"
                                            value={formData.websiteUrl} onChange={handleFormChange}
                                            className="hosp-input hosp-input-with-icon"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="hosp-form-section-inner">
                            <h2 className="hosp-form-section-title">Contact Information <span className="opt">(Optional)</span></h2>
                            <div className="hosp-form-grid-2">
                                <div className="hosp-field">
                                    <label className="hosp-label">Contact Email</label>
                                    <div className="hosp-input-icon-wrap">
                                        <Mail size={14} className="hosp-input-icon" />
                                        <input type="email" name="email" placeholder="contact@hospital.com"
                                            value={formData.email} onChange={handleFormChange}
                                            className="hosp-input hosp-input-with-icon" />
                                    </div>
                                </div>
                                <div className="hosp-field">
                                    <label className="hosp-label">Phone Number</label>
                                    <div className="hosp-input-icon-wrap">
                                        <Phone size={14} className="hosp-input-icon" />
                                        <input type="tel" name="phone" placeholder="+1234567890"
                                            value={formData.phone} onChange={handleFormChange}
                                            className="hosp-input hosp-input-with-icon" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="hosp-form-section-inner">
                            <h2 className="hosp-form-section-title">Address <span className="opt">(Optional)</span></h2>
                            <div className="hosp-field" style={{ marginBottom: 12 }}>
                                <label className="hosp-label">Street Address</label>
                                <input type="text" name="street" maxLength={250}
                                    placeholder="123 Health Ave, Suite 400"
                                    value={formData.street} onChange={handleFormChange}
                                    className="hosp-input" />
                            </div>
                            <div className="hosp-form-grid-4">
                                {[
                                    { name: 'city', label: 'City', placeholder: 'New York' },
                                    { name: 'state', label: 'State', placeholder: 'NY' },
                                    { name: 'country', label: 'Country', placeholder: 'United States' },
                                    { name: 'postalCode', label: 'Postal Code', placeholder: '10001' },
                                ].map(f => (
                                    <div key={f.name} className="hosp-field">
                                        <label className="hosp-label">{f.label}</label>
                                        <input type="text" name={f.name} placeholder={f.placeholder}
                                            value={formData[f.name]} onChange={handleFormChange}
                                            className="hosp-input" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Timezone */}
                        <div className="hosp-form-section-inner">
                            <h2 className="hosp-form-section-title">Localization</h2>
                            <div className="hosp-field" style={{ maxWidth: 280 }}>
                                <label className="hosp-label">Timezone</label>
                                <select name="timezone" value={formData.timezone}
                                    onChange={handleFormChange} className="hosp-input hosp-select">
                                    {COMMON_TIMEZONES.map(tz => (
                                        <option key={tz} value={tz}>{tz}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="hosp-form-actions">
                            <button type="button" onClick={() => setActiveView('list')} className="hosp-btn-ghost">
                                Cancel
                            </button>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="button" onClick={() => setFormData(INITIAL_FORM_STATE)}
                                    disabled={isSubmitting} className="hosp-btn-ghost">
                                    Reset
                                </button>
                                <button type="submit" disabled={isSubmitting} className="hosp-btn-primary">
                                    {isSubmitting
                                        ? <><Loader2 size={14} className="spin" />Registering…</>
                                        : 'Register Hospital'
                                    }
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
