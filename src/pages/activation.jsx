import { useState, useEffect, useCallback } from 'react';
import { chatbotService } from '../services/chatbot.service.js';
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
    const [chatbots, setChatbots] = useState([]);
    const [isFetching, setIsFetching] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [activatingId, setActivatingId] = useState(null);
    const [activationMenuId, setActivationMenuId] = useState(null);
    const [crawlType, setCrawlType] = useState('website_crawl');
    const [consentChecked, setConsentChecked] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadedDocs, setUploadedDocs] = useState([]);

    const handleFileChange = async (e, chatbotId) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(files);
        if (files.length === 0) {
            setUploadedDocs([]);
            return;
        }
        try {
            const uploads = await Promise.all(
                files.map(file =>
                    chatbotService.uploadKnowledgeDocs(chatbotId, file).then(res => ({
                        // Use the exact values returned by the backend upload response
                        fileName: res.fileName,
                        mimeType: res.mimeType,
                        fileRef: res.fileRef,
                        sizeBytes: res.sizeBytes,
                    }))
                )
            );
            setUploadedDocs(uploads);
        } catch (err) {
            console.error('Upload error:', err);
            alert('Failed to upload documents.');
            setUploadedDocs([]);
        }
    };

    const [copiedSnippet, setCopiedSnippet] = useState(null);
    const [revealedWidgets, setRevealedWidgets] = useState({});

    const fetchChatbots = useCallback(async () => {
        setIsFetching(true);
        setFetchError(null);
        try {
            const result = await chatbotService.getChatbots({ limit: 10 });
            setChatbots(result.data);
        } catch (err) {
            if (err.response?.status === 404) {
                setChatbots([]);
            } else {
                setFetchError('Failed to load chatbots. Please try again.');
            }
        } finally {
            setIsFetching(false);
        }
    }, []);

    useEffect(() => {
        fetchChatbots();
    }, [fetchChatbots]);

    const handleActivate = async (chatbot) => {
        if (crawlType === 'website_crawl' && !consentChecked) {
            alert('Please confirm that the website is available.');
            return;
        }

        setActivatingId(chatbot._id);
        try {
            const payload = {
                type: crawlType,
            };
            if (crawlType === 'website_crawl') {
                payload.websiteUrl = chatbot.website?.url;
                if (!payload.websiteUrl) {
                    alert('Chatbot does not have a website URL set.');
                    return;
                }
            } else if (crawlType === 'document_crawl') {
                if (selectedFiles.length === 0) {
                    alert('Please select at least one document to crawl.');
                    return;
                }
                payload.documents = uploadedDocs;
            }

            await chatbotService.activateBot(chatbot._id, payload);
            setActivationMenuId(null);
            setCrawlType('website_crawl');
            setConsentChecked(false);
            setSelectedFiles([]);
            await fetchChatbots();
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

    const StatusBadge = ({ chatbot }) => {
        if (isReady(chatbot)) {
            return <span className="hosp-badge-active">Active</span>;
        }
        if (isProcessing(chatbot)) {
            return (
                <span className="act-badge act-badge-processing">
                    <Loader2 size={11} className="spin" /> Processing
                </span>
            );
        }
        if (isCrawling(chatbot)) {
            return (
                <span className="act-badge act-badge-crawling">
                    <Loader2 size={11} className="spin" /> Crawling
                </span>
            );
        }
        if (isFailed(chatbot)) {
            return <span className="act-badge act-badge-failed"><AlertCircle size={11} /> Failed</span>;
        }
        return <span className="act-badge act-badge-idle"><Clock size={11} /> Not activated</span>;
    };

    if (isFetching) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 14 }}>
                <Loader2 size={28} className="spin" style={{ color: 'var(--color-teal)' }} />
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Loading chatbots…</p>
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
                    onClick={fetchChatbots}
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
            {!isFetching && chatbots.length === 0 && !fetchError && (
                <div className="hosp-empty">
                    <div className="hosp-empty-icon"><Building2 size={28} /></div>
                    <h3 className="hosp-empty-title">No Chatbots Found</h3>
                    <p className="hosp-empty-desc">You need to create a chatbot first before activating the bot.</p>
                </div>
            )}

            {/* Cards */}
            {chatbots.length > 0 && (
                <div className="hosp-card-list">
                    {chatbots.map(chatbot => (
                        <div key={chatbot._id} className="hosp-card card-enter">
                            <div className="hosp-card-content">
                                {/* Header */}
                                <div className="hosp-card-header">
                                    <h3 className="hosp-card-name">{chatbot.name}</h3>
                                    <StatusBadge chatbot={chatbot} />
                                </div>

                                {/* Subtitle */}
                                <div className="hosp-card-slug">
                                    {chatbot.website?.url}
                                </div>

                                {/* Activate button (not yet activated) */}
                                {!isReady(chatbot) && !isCrawling(chatbot) && !isProcessing(chatbot) && (
                                    <div style={{ marginTop: 14 }}>
                                        {activationMenuId === chatbot._id ? (
                                            <div className="hosp-activation-menu" style={{ padding: '12px', border: '1px solid var(--color-border)', borderRadius: '8px', marginTop: '10px' }}>
                                                <div style={{ marginBottom: '10px' }}>
                                                    <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '6px', display: 'block' }}>Crawl Type</label>
                                                    <select
                                                        value={crawlType}
                                                        onChange={(e) => setCrawlType(e.target.value)}
                                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
                                                    >
                                                        <option value="website_crawl">Website Crawl</option>
                                                        <option value="document_crawl">Document Crawl</option>
                                                    </select>
                                                </div>

                                                {crawlType === 'website_crawl' && (
                                                    <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                                        <input
                                                            type="checkbox"
                                                            id={`consent-${chatbot._id}`}
                                                            checked={consentChecked}
                                                            onChange={(e) => setConsentChecked(e.target.checked)}
                                                            style={{ marginTop: '4px' }}
                                                        />
                                                        <label htmlFor={`consent-${chatbot._id}`} style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                                                            I confirm that the website ({chatbot.website?.url || 'N/A'}) is publicly available and accessible. If it is unreachable or private, the crawl may fail.
                                                        </label>
                                                    </div>
                                                )}

                                                {crawlType === 'document_crawl' && (
                                                    <div style={{ marginBottom: '12px' }}>
                                                        <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '6px', display: 'block' }}>
                                                            Upload Documents
                                                        </label>
                                                        <input
                                                            type="file"
                                                            multiple
                                                            onChange={(e) => handleFileChange(e, chatbot._id)}
                                                            style={{
                                                                width: '100%',
                                                                padding: '6px',
                                                                fontSize: '13px',
                                                                color: 'var(--color-text)',
                                                                border: '1px dashed var(--color-border)',
                                                                borderRadius: '4px'
                                                            }}
                                                        />
                                                        {selectedFiles.length > 0 && (
                                                            <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                                                {selectedFiles.length} file(s) selected
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        onClick={() => handleActivate(chatbot)}
                                                        disabled={activatingId === chatbot._id || (crawlType === 'website_crawl' && !consentChecked) || (crawlType === 'document_crawl' && uploadedDocs.length === 0)}
                                                        className="hosp-btn-primary"
                                                        style={{ flex: 1, justifyContent: 'center' }}
                                                    >
                                                        {activatingId === chatbot._id
                                                            ? <><Loader2 size={14} className="spin" />Activating…</>
                                                            : 'Start Activation'
                                                        }
                                                    </button>
                                                    <button
                                                        onClick={() => setActivationMenuId(null)}
                                                        disabled={activatingId === chatbot._id}
                                                        className="hosp-btn-secondary"
                                                        style={{ padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: '6px', backgroundColor: 'transparent', color: 'var(--color-text)', cursor: 'pointer' }}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setActivationMenuId(chatbot._id)}
                                                className="hosp-btn-primary"
                                                style={{ width: '100%', justifyContent: 'center' }}
                                            >
                                                Activate Chatbot
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Once crawler is done and status becomes active:
                                    Only show "Generate Copyable widget" button until clicked */}
                                {isReady(chatbot) && !revealedWidgets[chatbot._id] && (
                                    <div style={{ marginTop: 14 }}>
                                        <button
                                            onClick={() => setRevealedWidgets(prev => ({ ...prev, [chatbot._id]: true }))}
                                            className="hosp-btn-primary"
                                        >
                                            Generate Copyable widget
                                        </button>
                                    </div>
                                )}

                                {/* Once user clicks "Generate Copyable widget": show embed widget */}
                                {isReady(chatbot) && revealedWidgets[chatbot._id] && (
                                    <div className="act-embed-container">
                                        <div className="act-embed-heading">
                                            Embed widget
                                        </div>
                                        <div className="hosp-key-box act-code-box">
                                            <code className="act-code-text">
                                                {`<script src="widget.js" data-public-key="${chatbot.publicKey ? chatbot.publicKey.slice(0, 5) + '...' : '61584...'}">`}
                                            </code>
                                            <button
                                                onClick={() => handleCopySnippet(chatbot.publicKey)}
                                                className="hosp-copy-btn"
                                                title="Copy snippet"
                                            >
                                                {copiedSnippet === chatbot.publicKey
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
