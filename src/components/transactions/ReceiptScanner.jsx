import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, X, Check, RefreshCw, Sparkles, AlertCircle, FileImage } from 'lucide-react';
import { extractTextFromImage } from '../../services/ocrService';
import { extractReceiptData } from '../../services/receiptAiService';
import { CATEGORY_MAP } from '../../utils/constants';

/* ─── State Machine ──────────────────────────────────────── */
const STATES = {
  IDLE: 'idle',
  PREVIEW: 'preview',
  SCANNING: 'scanning',
  REVIEW: 'review',
  ERROR: 'error',
};

/* ─── ReceiptScanner Component ───────────────────────────── */
export default function ReceiptScanner({ onApply }) {
  const [state, setState] = useState(STATES.IDLE);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [progress, setProgress] = useState(0);
  const [ocrText, setOcrText] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  /* ─── File handling ──────────────────────────────────────── */
  const handleFile = useCallback((selectedFile) => {
    if (!selectedFile) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a JPG, PNG, or WebP image.');
      setState(STATES.ERROR);
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('Image is too large. Maximum size is 10MB.');
      setState(STATES.ERROR);
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setState(STATES.PREVIEW);
    setError('');
  }, []);

  /* ─── Drag & Drop ────────────────────────────────────────── */
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFile(droppedFile);
  }, [handleFile]);

  /* ─── Scan receipt ───────────────────────────────────────── */
  const handleScan = useCallback(async () => {
    if (!file) return;

    setState(STATES.SCANNING);
    setProgress(0);
    setError('');

    try {
      // Step 1: OCR
      const text = await extractTextFromImage(file, (p) => {
        setProgress(Math.round(p * 0.7)); // OCR = 0-70%
      });
      setOcrText(text);
      setProgress(75);

      // Step 2: AI extraction
      const data = await extractReceiptData(text);
      setProgress(100);
      setExtractedData(data);

      // Brief pause to show 100%
      await new Promise((r) => setTimeout(r, 400));
      setState(STATES.REVIEW);
    } catch (err) {
      setError(err.message || 'Failed to scan receipt. Please try again.');
      setState(STATES.ERROR);
    }
  }, [file]);

  /* ─── Reset ──────────────────────────────────────────────── */
  const handleReset = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setProgress(0);
    setOcrText('');
    setExtractedData(null);
    setError('');
    setState(STATES.IDLE);
  }, [previewUrl]);

  /* ─── Apply to form ──────────────────────────────────────── */
  const handleApply = useCallback(() => {
    if (extractedData && onApply) {
      onApply(extractedData);
    }
    handleReset();
  }, [extractedData, onApply, handleReset]);

  /* ─── Category label lookup ──────────────────────────────── */
  const getCategoryLabel = (id) => {
    const cat = CATEGORY_MAP[id];
    return cat ? `${cat.icon} ${cat.label}` : id;
  };

  /* ─── Animations ─────────────────────────────────────────── */
  const containerVariants = {
    hidden: { opacity: 0, height: 0, scale: 0.97 },
    visible: { opacity: 1, height: 'auto', scale: 1, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } },
    exit: { opacity: 0, height: 0, scale: 0.97, transition: { duration: 0.3, ease: 'easeIn' } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } },
  };

  /* ─── Render ─────────────────────────────────────────────── */
  return (
    <div className="mb-5">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
          <Camera size={14} className="text-white" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400">
          Smart Receipt Scanner
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-surface-200 dark:from-surface-700 to-transparent" />
      </div>

      <AnimatePresence mode="wait">
        {/* ─── IDLE: Drop Zone ─────────────────────────────────── */}
        {state === STATES.IDLE && (
          <motion.div
            key="idle"
            layout
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div
              className={`receipt-drop-zone relative overflow-hidden group ${isDragging ? 'receipt-drop-zone-active' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleFile(e.target.files[0])}
                className="hidden"
              />
              <motion.div
                className="flex flex-col items-center gap-3 py-3 relative z-10"
                animate={isDragging ? { scale: 1.05 } : { scale: 1 }}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-100 to-purple-100 dark:from-brand-500/20 dark:to-purple-500/20 flex items-center justify-center shadow-inner">
                  <Upload size={24} className="text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    Drop receipt image here
                  </p>
                  <p className="text-xs font-medium text-surface-400 dark:text-surface-500 mt-1">
                    or click to browse · JPG, PNG, WebP
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ─── PREVIEW: Image Thumbnail ────────────────────────── */}
        {state === STATES.PREVIEW && (
          <motion.div
            key="preview"
            layout
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="receipt-preview-card"
          >
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0 group">
                <img
                  src={previewUrl}
                  alt="Receipt preview"
                  className="w-20 h-20 object-cover rounded-xl border-2 border-white/60 dark:border-surface-700/50 shadow-md transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <button
                  onClick={handleReset}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors hover:scale-110"
                >
                  <X size={12} />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">
                  {file?.name}
                </p>
                <p className="text-xs font-medium text-surface-400 mt-1">
                  {(file?.size / 1024).toFixed(0)} KB · Ready to scan
                </p>
              </div>
              <button
                onClick={handleScan}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 text-white text-sm font-bold shadow-lg shadow-brand-500/25 hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
              >
                <Sparkles size={16} />
                Scan
              </button>
            </div>
          </motion.div>
        )}

        {/* ─── SCANNING: Progress ──────────────────────────────── */}
        {state === STATES.SCANNING && (
          <motion.div
            key="scanning"
            layout
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="receipt-preview-card overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-500/5 to-transparent shimmer" />
            <div className="relative z-10 flex items-center gap-3 mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles size={20} className="text-brand-500" />
              </motion.div>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                {progress < 70 ? 'Scanning receipt...' : 'Extracting data with AI...'}
              </span>
              <span className="ml-auto text-xs font-extrabold text-brand-600 dark:text-brand-400">
                {progress}%
              </span>
            </div>
            <div className="receipt-progress-track relative z-10">
              <motion.div
                className="receipt-progress-bar"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
            <p className="text-[11px] font-medium text-surface-400 dark:text-surface-500 mt-3 relative z-10">
              {progress < 30
                ? 'Loading OCR engine...'
                : progress < 70
                ? 'Reading text from receipt...'
                : 'AI is analyzing the extracted text...'}
            </p>
          </motion.div>
        )}

        {/* ─── REVIEW: Extracted Data ──────────────────────────── */}
        {state === STATES.REVIEW && extractedData && (
          <motion.div
            key="review"
            layout
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="receipt-review-card relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-5 relative z-10">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                <div className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping" style={{ animationDuration: '3s' }} />
                <Check size={16} className="text-emerald-600 dark:text-emerald-400 relative z-10" />
              </div>
              <span className="text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
                Data Extracted Successfully
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                {
                  label: 'Amount',
                  value: extractedData.amount != null ? `₹${extractedData.amount.toLocaleString()}` : '—',
                  icon: '💰',
                },
                {
                  label: 'Date',
                  value: extractedData.date || '—',
                  icon: '📅',
                },
                {
                  label: 'Category',
                  value: getCategoryLabel(extractedData.category),
                  icon: '',
                },
                {
                  label: 'Merchant',
                  value: extractedData.merchant || '—',
                  icon: '🏪',
                },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: i * 0.08 }}
                  className="p-3 rounded-xl bg-surface-50/80 dark:bg-surface-800/50 border border-surface-100 dark:border-surface-700/50"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500 mb-1">
                    {item.label}
                  </p>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">
                    {item.icon && <span className="mr-1">{item.icon}</span>}
                    {item.value}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* OCR Text Preview (collapsible) */}
            <details className="mb-4">
              <summary className="text-[11px] font-semibold text-surface-400 dark:text-surface-500 cursor-pointer hover:text-surface-600 dark:hover:text-surface-300 transition-colors">
                View raw OCR text
              </summary>
              <pre className="mt-2 p-3 rounded-lg bg-surface-100/80 dark:bg-surface-800/80 text-[11px] text-surface-600 dark:text-surface-400 font-mono leading-relaxed max-h-32 overflow-y-auto whitespace-pre-wrap">
                {ocrText}
              </pre>
            </details>

            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 text-sm font-semibold hover:bg-surface-100 dark:hover:bg-surface-800 transition-all"
              >
                <RefreshCw size={14} />
                Retry
              </button>
              <button
                onClick={handleApply}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-xl transition-all"
              >
                <Check size={14} />
                Apply to Form
              </button>
            </div>
          </motion.div>
        )}

        {/* ─── ERROR ───────────────────────────────────────────── */}
        {state === STATES.ERROR && (
          <motion.div
            key="error"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="receipt-preview-card"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-500/15 flex items-center justify-center flex-shrink-0">
                <AlertCircle size={18} className="text-red-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-0.5">
                  Scan Failed
                </p>
                <p className="text-xs text-red-600/80 dark:text-red-400/70 leading-relaxed">
                  {error}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 text-sm font-semibold hover:bg-surface-100 dark:hover:bg-surface-800 transition-all"
              >
                <RefreshCw size={14} />
                Try Again
              </button>
              <button
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-surface-500 text-sm font-medium hover:text-surface-700 dark:hover:text-surface-300 transition-colors"
              >
                <FileImage size={14} />
                Enter Manually
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
