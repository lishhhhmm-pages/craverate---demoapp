
import React, { useState, useRef, useEffect } from 'react';
import { X, Search, MapPin, Camera, Star, ChevronLeft, Upload, Loader2, Wand2 } from 'lucide-react';
import { Business, DraftPost } from '../types';
import { api } from '../services/api';
import { GoogleGenAI } from "@google/genai";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
  preselectedBusiness?: Business | null;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onPostCreated, preselectedBusiness }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiEditing, setIsAiEditing] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Business[]>([]);
  
  const [draft, setDraft] = useState<DraftPost>({
    businessId: null,
    businessName: '',
    mediaFile: null,
    mediaPreviewUrl: '',
    rating: 0,
    text: '',
    tags: []
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
        if (preselectedBusiness) {
            setDraft(prev => ({ ...prev, businessId: preselectedBusiness.id, businessName: preselectedBusiness.name }));
            setStep(2);
        } else {
            setStep(1);
        }
    }
  }, [isOpen, preselectedBusiness]);

  useEffect(() => {
    if (step === 1) api.searchBusinesses(searchQuery).then(setSearchResults);
  }, [searchQuery, step]);

  const selectBusiness = (biz: Business) => {
    setDraft(prev => ({ ...prev, businessId: biz.id, businessName: biz.name }));
    setStep(2);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDraft(prev => ({ ...prev, mediaFile: file, mediaPreviewUrl: URL.createObjectURL(file) }));
      setStep(3);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleAiEdit = async () => {
    if (!aiPrompt.trim() || !draft.mediaPreviewUrl) return;
    setIsAiEditing(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await fetch(draft.mediaPreviewUrl);
      const blob = await response.blob();
      const base64Data = await blobToBase64(blob);

      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: blob.type,
              },
            },
            {
              text: aiPrompt,
            },
          ],
        },
      });

      const parts = result.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData) {
          const newBase64 = part.inlineData.data;
          const newUrl = `data:image/png;base64,${newBase64}`;
          setDraft(prev => ({ ...prev, mediaPreviewUrl: newUrl }));
          break;
        }
      }
      setAiPrompt('');
    } catch (error) {
      console.error("AI Edit failed:", error);
      alert("AI Edit failed. Please try a different prompt.");
    } finally {
      setIsAiEditing(false);
    }
  };

  const handlePost = async () => {
    setIsSubmitting(true);
    try {
      const hashtags = draft.text.match(/#[a-z0-9_]+/gi)?.map(t => t.substring(1)) || [];
      await api.createPost({
        businessId: draft.businessId!,
        businessName: draft.businessName,
        rating: draft.rating,
        text: draft.text,
        imageUrl: draft.mediaPreviewUrl,
        mediaType: 'image',
        tags: hashtags
      });
      onPostCreated();
      onClose();
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[60] flex flex-col bg-white animate-[slideUp_0.3s_ease-out] overflow-hidden">
      {/* HEADER */}
      <div className="px-4 h-14 flex-shrink-0 flex items-center justify-between border-b border-gray-100 bg-white">
        <button 
          onClick={() => {
              if (step === 2 && preselectedBusiness) onClose();
              else if (step > 1) setStep((step - 1) as any);
              else onClose();
          }}
          className="p-2 -ml-2 text-gray-900"
        >
          {(step === 1 || (step === 2 && preselectedBusiness)) ? <X className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
        </button>
        <span className="font-black text-sm uppercase tracking-widest text-gray-900">
          {step === 1 ? 'Location' : step === 2 ? 'Share' : 'Details'}
        </span>
        <div className="w-10" />
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto bg-gray-50 no-scrollbar">
        {step === 1 && (
          <div className="p-5 space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Where are you eating?" className="w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-orange-500" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus />
            </div>
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Suggested Places</h4>
              {searchResults.map(biz => (
                <button key={biz.id} onClick={() => selectBusiness(biz)} className="w-full flex items-center space-x-3 p-4 bg-white rounded-2xl border border-gray-50 shadow-sm active:scale-[0.98] transition-all text-left">
                  <img src={biz.avatarUrl} className="w-10 h-10 rounded-xl object-cover" alt="" />
                  <div>
                    <h5 className="font-bold text-gray-900 text-sm">{biz.name}</h5>
                    <p className="text-xs text-gray-500">{biz.location}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
           <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-6">
              <div className="space-y-2">
                  <h3 className="text-2xl font-black text-gray-900 leading-tight">Visuals for {draft.businessName}</h3>
                  <p className="text-sm text-gray-500 font-medium">Capture or upload a photo to share</p>
              </div>
              
              <div className="grid grid-cols-1 gap-4 w-full">
                <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />
                <button onClick={() => fileInputRef.current?.click()} className="py-12 bg-white border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400 space-y-2 hover:border-orange-200 hover:bg-orange-50/30 transition-all">
                   <Upload className="w-8 h-8" />
                   <span className="font-black text-[10px] uppercase tracking-widest">Select photo from library</span>
                </button>
              </div>
              
              <button className="w-full py-5 bg-gray-900 text-white rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-3 shadow-xl active:scale-95 transition-all">
                 <Camera className="w-5 h-5" />
                 <span>Open Camera</span>
              </button>
           </div>
        )}

        {step === 3 && (
          <div className="min-h-full bg-white pb-32">
             <div className="w-full h-80 bg-gray-900 relative group">
                <img src={draft.mediaPreviewUrl} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                {/* AI EDIT OVERLAY */}
                <div className="absolute top-4 right-4 z-10">
                   <div className="flex flex-col items-end space-y-2">
                      <div className="bg-black/60 backdrop-blur-md p-1.5 rounded-full border border-white/20 flex items-center">
                         <input 
                           type="text" 
                           placeholder="AI Edit prompt..." 
                           className="bg-transparent text-xs text-white px-3 py-1 outline-none w-40 font-bold placeholder:text-white/40"
                           value={aiPrompt}
                           onChange={(e) => setAiPrompt(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && handleAiEdit()}
                         />
                         <button 
                           onClick={handleAiEdit}
                           disabled={isAiEditing || !aiPrompt.trim()}
                           className="p-2 bg-orange-600 rounded-full text-white active:scale-90 transition-all disabled:opacity-50"
                         >
                            {isAiEditing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                         </button>
                      </div>
                      <p className="text-[9px] font-black text-white/60 uppercase tracking-widest bg-black/40 px-2 py-1 rounded-lg">Try: "Add retro filter", "Add a burger" or "Make it vibrant"</p>
                   </div>
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                   <h2 className="text-white font-black text-2xl leading-tight mb-1">{draft.businessName}</h2>
                   <div className="flex items-center text-white/60 text-[10px] font-black uppercase tracking-widest">
                      <MapPin className="w-3 h-3 mr-1" /> Verified Location
                   </div>
                </div>
             </div>

             <div className="p-6 space-y-8">
                <div className="flex flex-col items-center space-y-4">
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">How would you rate it?</span>
                   <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => setDraft(p => ({...p, rating: star}))} className="transition-all active:scale-90 hover:scale-110">
                          <Star className={`w-10 h-10 ${star <= draft.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-100'}`} />
                        </button>
                      ))}
                   </div>
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Write your experience</label>
                    <textarea className="w-full h-40 p-5 bg-gray-50 rounded-[1.5rem] border-none focus:ring-2 focus:ring-orange-500 outline-none resize-none font-medium text-gray-800 text-sm" placeholder="Tell us about the flavors, the service, the vibe... #foodie" value={draft.text} onChange={(e) => setDraft(p => ({...p, text: e.target.value}))} />
                </div>
             </div>
          </div>
        )}
      </div>

      {step === 3 && (
        <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0 safe-pb">
           <button onClick={handlePost} disabled={isSubmitting || draft.rating === 0} className="w-full py-5 bg-orange-600 text-white font-black uppercase tracking-widest text-xs rounded-[1.5rem] shadow-xl shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center space-x-3 disabled:opacity-50">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Upload className="w-5 h-5" /> <span>Publish to Feed</span></>}
           </button>
        </div>
      )}
    </div>
  );
};
