import { useRef, useState } from 'react';
import { Upload, X, Film, GripVertical, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadMedia } from '../services/storage.js';

const MAX_MB = 20;

/**
 * VideoUploader — একাধিক ভিডিও আপলোড, ড্র্যাগ করে ক্রম বদল, থাম্বনেইল।
 * প্রথম ভিডিওটিই প্রোডাক্ট পেজে ডিফল্ট হিসেবে দেখানো হয়।
 */
export default function VideoUploader({ videos = [], onChange }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const dragIndex = useRef(null);

  const handleFiles = async (files) => {
    setBusy(true);
    try {
      const uploaded = [];
      for (const file of files) {
        if (file.size > MAX_MB * 1024 * 1024) {
          toast.error(`${file.name} — ${MAX_MB}MB-এর চেয়ে বড়, বাদ দেওয়া হলো`);
          continue;
        }
        const url = await uploadMedia(file, file.name);
        uploaded.push(url);
      }
      if (uploaded.length) {
        onChange([...videos, ...uploaded]);
        toast.success(`${uploaded.length}টি ভিডিও যোগ হয়েছে`);
      }
    } catch (e) {
      toast.error('ভিডিও আপলোড ব্যর্থ: ' + e.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = (i) => onChange(videos.filter((_, idx) => idx !== i));

  const makePrimary = (i) => {
    const next = [...videos];
    const [item] = next.splice(i, 1);
    onChange([item, ...next]);
  };

  const onDrop = (i) => {
    if (dragIndex.current === null || dragIndex.current === i) return;
    const next = [...videos];
    const [item] = next.splice(dragIndex.current, 1);
    next.splice(i, 0, item);
    dragIndex.current = null;
    onChange(next);
  };

  return (
    <div>
      <div
        className="border-2 border-dashed border-line rounded-card p-6 text-center
          hover:border-accent/50 transition-colors cursor-pointer"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles([...e.dataTransfer.files]);
        }}
      >
        <Film className="mx-auto text-ink-muted" size={24} />
        <p className="text-sm text-ink-muted mt-2">
          {busy ? 'আপলোড হচ্ছে…' : `ভিডিও (mp4/webm) — সর্বোচ্চ ${MAX_MB}MB প্রতিটি, একাধিক সিলেক্ট করা যাবে`}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm"
          multiple
          hidden
          onChange={(e) => handleFiles([...e.target.files])}
        />
      </div>

      <div className="flex gap-2 mt-3">
        <input
          className="input"
          placeholder="অথবা ভিডিও URL (MP4/YouTube)"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
        />
        <button
          type="button"
          className="btn-ghost shrink-0"
          onClick={() => {
            if (!urlInput.trim()) return;
            onChange([...videos, urlInput.trim()]);
            setUrlInput('');
          }}
        >
          যোগ করুন
        </button>
      </div>

      {videos.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mt-4">
          {videos.map((src, i) => (
            <div
              key={src + i}
              draggable
              onDragStart={() => (dragIndex.current = i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(i)}
              className="relative group rounded-field overflow-hidden border border-line bg-black"
            >
              <video src={src} controls className="w-full aspect-video bg-black" />
              {i === 0 && (
                <span className="absolute top-2 left-2 badge bg-accent text-black text-[10px]">
                  প্রধান
                </span>
              )}
              <div className="absolute top-2 right-2 flex gap-1.5">
                {i !== 0 && (
                  <button
                    type="button"
                    title="প্রধান ভিডিও করুন"
                    className="p-1.5 rounded bg-white/15 hover:bg-white/30"
                    onClick={() => makePrimary(i)}
                  >
                    <Star size={14} />
                  </button>
                )}
                <button
                  type="button"
                  title="ডিলিট"
                  className="p-1.5 rounded bg-red-500/50 hover:bg-red-500/70"
                  onClick={() => remove(i)}
                >
                  <X size={14} />
                </button>
              </div>
              <span className="absolute bottom-2 left-2 p-1 rounded bg-black/50 text-ink-muted cursor-grab opacity-0 group-hover:opacity-100">
                <GripVertical size={14} />
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
