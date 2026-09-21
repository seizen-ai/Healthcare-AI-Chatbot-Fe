import { useState, useEffect, useCallback } from 'react';
import { hospitalService } from '../services/hospital.service.js';
import {
    Building2,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Copy,
    Check,
    Code,
    RefreshCw,
    Clock
} from 'lucide-react';

export default function Activation() {
    const [hospitals, setHospitals] = useState([]);
    const [isFetching, setIsFetching] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [activatingId, setActivatingId] = useState(null);
    const [copiedSnippet, setCopiedSnippet] = useState(null);
    const [revealedWidgets, setRevealedWidgets] = useState({});

    const fetchHospitals = useCallback(async () => {
        setIsFetching(true);
        setFetchError(null);
        try {
            const result = await hospitalService.getHospitals({ limit: 10 });
            setHospitals(result.data);
        } catch (err) {
            if (err.response?.status === 404) {
                setHospitals([]);
            } else {
                setFetchError('Failed to load hospitals. Please try again.');
            }
        } finally {
            setIsFetching(false);
        }
    }, []);

    useEffect(() => {
        fetchHospitals();
    }, [fetchHospitals]);

    const handleActivate = async (hospitalId) => {
        setActivatingId(hospitalId);
        try {
            await hospitalService.activateBot(hospitalId);
            await fetchHospitals();
        } catch (err) {
            console.error('Failed to activate bot:', err);
            const msg = err.response?.data?.message || err.message || 'Failed to activate bot.';
            alert(`Error: ${msg}`);
        } finally {
            setActivatingId(null);
        }
    };

    const handleCopySnippet = (publicKey) => {
        const snippet = `<script src="${window.location.origin}/widget.js" data-public-key="${publicKey} defer"></script>`;
        navigator.clipboard.writeText(snippet);
        setCopiedSnippet(publicKey);
        setTimeout(() => setCopiedSnippet(null), 2000);
    };

    const isReady = (h) => h.status === 'active' || h.onboarding?.step === 'knowledge_ready' || h.onboarding?.step === 'active';
    const isProcessing = (h) => !isReady(h) && h.onboarding?.step === 'knowledge_processing';
    const isCrawling = (h) => !isReady(h) && h.onboarding?.step === 'crawling';
    const isFailed = (h) => !isReady(h) && h.onboarding?.step === 'crawler_failed';
    const isActivated = (h) => isReady(h);

    const StatusBadge = ({ hospital }) => {
        if (isReady(hospital)) {
            return <span className="hosp-badge-active">Active</span>;
        }
        if (isProcessing(hospital)) {
            return (
                <span className="act-badge act-badge-processing">
                    <Loader2 size={11} className="spin" /> Processing
                </span>
            );
        }
        if (isCrawling(hospital)) {
            return (
                <span className="act-badge act-badge-crawling">
                    <Loader2 size={11} className="spin" /> Crawling
                </span>
            );
        }
        if (isFailed(hospital)) {
            return <span className="act-badge act-badge-failed"><AlertCircle size={11} /> Failed</span>;
        }
        return <span className="act-badge act-badge-idle"><Clock size={11} /> Not activated</span>;
    };

    if (isFetching) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 14 }}>
                <Loader2 size={28} className="spin" style={{ color: 'var(--color-teal)' }} />
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Loading hospitals…</p>
            </div>
        );
    }

    return (
        <div className="hosp-page page-enter">
            {/* ── Page Header ── */}
            <div className="hosp-header">
                <div className="hosp-header-left">
                    <h1 className="hosp-title">Bot activation</h1>
                    <p className="hosp-subtitle">Activate your assistant and get the embed script.</p>
                </div>
                <button
                    onClick={fetchHospitals}
                    className="hosp-btn-primary"
                >
                    Refresh status
                </button>
            </div>

            {/* Error */}
            {fetchError && (
                <div className="hosp-alert hosp-alert-error" style={{ marginBottom: 16 }}>
                    <AlertCircle size={16} />
                    <span>{fetchError}</span>
                </div>
            )}

            {/* Empty */}
            {!isFetching && hospitals.length === 0 && !fetchError && (
                <div className="hosp-empty">
                    <div className="hosp-empty-icon"><Building2 size={28} /></div>
                    <h3 className="hosp-empty-title">No Hospitals Found</h3>
                    <p className="hosp-empty-desc">You need to create a hospital first before activating the bot.</p>
                </div>
            )}

            {/* Cards */}
            {hospitals.length > 0 && (
                <div className="hosp-card-list">
                    {hospitals.map(hospital => (
                        <div key={hospital._id} className="hosp-card card-enter">
                            <div className="hosp-card-content">
                                {/* Header */}
                                <div className="hosp-card-header">
                                    <h3 className="hosp-card-name">{hospital.name}</h3>
                                    <StatusBadge hospital={hospital} />
                                </div>

                                {/* Subtitle */}
                                <div className="hosp-card-slug">
                                    {hospital.website?.url || 'southcityhospital.com'}
                                </div>

                                {/* Activate button (not yet activated) */}
                                {!isReady(hospital) && !isCrawling(hospital) && !isProcessing(hospital) && (
                                    <div style={{ marginTop: 14 }}>
                                        <button
                                            onClick={() => handleActivate(hospital._id)}
                                            disabled={activatingId === hospital._id}
                                            className="hosp-btn-primary"
                                            style={{ width: '100%', justifyContent: 'center' }}
                                        >
                                            {activatingId === hospital._id
                                                ? <><Loader2 size={14} className="spin" />Activating…</>
                                                : 'Activate Chatbot'
                                            }
                                        </button>
                                    </div>
                                )}

                                {/* Once crawler is done and status becomes active:
                                    Only show "Generate Copyable widget" button until clicked */}
                                {isReady(hospital) && !revealedWidgets[hospital._id] && (
                                    <div style={{ marginTop: 14 }}>
                                        <button
                                            onClick={() => setRevealedWidgets(prev => ({ ...prev, [hospital._id]: true }))}
                                            className="hosp-btn-primary"
                                        >
                                            Generate Copyable widget
                                        </button>
                                    </div>
                                )}

                                {/* Once user clicks "Generate Copyable widget": show embed widget */}
                                {isReady(hospital) && revealedWidgets[hospital._id] && (
                                    <div className="act-embed-container">
                                        <div className="act-embed-heading">
                                            Embed widget
                                        </div>
                                        <div className="hosp-key-box act-code-box">
                                            <code className="act-code-text">
                                                {`<script src="widget.js" data-public-key="${hospital.publicKey ? hospital.publicKey.slice(0, 5) + '...' : '61584...'}">`}
                                            </code>
                                            <button
                                                onClick={() => handleCopySnippet(hospital.publicKey)}
                                                className="hosp-copy-btn"
                                                title="Copy snippet"
                                            >
                                                {copiedSnippet === hospital.publicKey
                                                    ? <Check size={13} style={{ color: '#20C997' }} />
                                                    : <Copy size={13} />
                                                }
                                            </button>
                                        </div>
                                        <p className="act-hint">
                                            Paste this into your site's head or body.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
