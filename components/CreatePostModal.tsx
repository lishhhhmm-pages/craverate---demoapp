import React, { useState, useRef } from 'react';
import { X, Search, MapPin, Camera, Star, ChevronLeft, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { Business, DraftPost } from '../types';
import { api } from '../services/api';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onPostCreated }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Business[]>([]);
  
  // Draft State
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

  // --- HANDLERS ---

  // Step 1: Search logic
  React.useEffect(() => {
    if (step === 1) {
      api.searchBusinesses(searchQuery).then(setSearchResults);
    }
  }, [searchQuery, step]);

  const selectBusiness = (biz: Business) => {
    setDraft(prev => ({ ...prev, businessId: biz.id, businessName: biz.name }));
    setStep(2);
  };

  // Step 2: Media Logic
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setDraft(prev => ({ ...prev, mediaFile: file, mediaPreviewUrl: url }));
      setStep(3);
    }
  };

  // Step 3: Posting Logic
  const handlePost = async () => {
    setIsSubmitting(true);
    try {
      // Create tags from text hashtags
      const hashtags = draft.text.match(/#[a-z0-9_]+/gi)?.map(t => t.substring(1)) || [];
      
      await api.createPost({
        businessId: draft.businessId!,
        businessName: draft.businessName,
        rating: draft.rating,
        text: draft.text,
        imageUrl: draft.mediaPreviewUrl, // In real app, we'd upload mediaFile to storage first
        mediaType: 'image', // simplified for demo
        tags: hashtags
      });
      
      onPostCreated();
      resetForm();
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setDraft({
      businessId: null,
      businessName: '',
      mediaFile: null,
      mediaPreviewUrl: '',
      rating: 0,
      text: '',
      tags: []
    });
    setSearchQuery('');
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white animate-[slideUp_0.3s_ease-out]">
      
      {/* HEADER */}
      <div className="px-4 h-14 flex items-center justify-between border-b border-gray-100">
        <button 
          onClick={() => step > 1 ? setStep(step - 1 as any) : onClose()}
          className="p-2 -ml-2 text-gray-900"
        >
          {step === 1 ? <X className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
        </button>
        <span className="font-bold text-gray-900">
          {step === 1 ? 'Select Place' : step === 2 ? 'Add Media' : 'Review'}
        </span>
        <div className="w-8" /> {/* Spacer */}
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto bg-gray-50 relative">
        
        {/* === STEP 1: SELECT PLACE === */}
        {step === 1 && (
          <div className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input 
                type="text"
                placeholder="Where are you?"
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-orange-500 outline-none shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Nearby</h4>
              {searchResults.map(biz => (
                <button 
                  key={biz.id} 
                  onClick={() => selectBusiness(biz)}
                  className="w-full flex items-center space-x-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm active:scale-[0.98] transition-all text-left"
                >
                  <img src={biz.avatarUrl} className="w-10 h-10 rounded-lg object-cover bg-gray-200" alt="" />
                  <div>
                    <h5 className="font-bold text-gray-900 text-sm">{biz.name}</h5>
                    <p className="text-xs text-gray-500">{biz.location}</p>
                  </div>
                </button>
              ))}
              {/* Fallback for "Create New Place" would go here in real app */}
            </div>
          </div>
        )}

        {/* === STEP 2: MEDIA === */}
        {step === 2 && (
           <div className="h-full flex flex-col items-center justify-center p-6 space-y-6">
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*,video/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-64 h-64 border-2 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center text-gray-400 space-y-4 bg-white hover:bg-gray-50 hover:border-orange-400 hover:text-orange-500 transition-all"
              >
                 <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8" />
                 </div>
                 <span className="font-bold text-sm">Select from Gallery</span>
              </button>

              <div className="flex items-center space-x-4 w-full px-8">
                 <div className="h-px bg-gray-300 flex-1" />
                 <span className="text-xs font-bold text-gray-400">OR</span>
                 <div className="h-px bg-gray-300 flex-1" />
              </div>

              <button className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg active:scale-95 transition-transform">
                 <Camera className="w-5 h-5" />
                 <span>Open Camera</span>
              </button>
           </div>
        )}

        {/* === STEP 3: DETAILS === */}
        {step === 3 && (
          <div className="min-h-full bg-white">
             {/* Media Preview Header */}
             <div className="w-full h-64 bg-gray-900 relative">
                <img src={draft.mediaPreviewUrl} className="w-full h-full object-cover opacity-80" alt="Preview" />
                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                   <h2 className="text-white font-black text-2xl">{draft.businessName}</h2>
                   <div className="flex items-center text-white/80 text-sm">
                      <MapPin className="w-3 h-3 mr-1" />
                      Athens, Greece
                   </div>
                </div>
             </div>

             <div className="p-6 space-y-6">
                
                {/* Rating */}
                <div className="flex flex-col items-center space-y-2">
                   <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rate Experience</span>
                   <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star} 
                          onClick={() => setDraft(p => ({...p, rating: star}))}
                          className="transition-transform active:scale-90"
                        >
                          <Star 
                            className={`w-10 h-10 ${star <= draft.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} 
                          />
                        </button>
                      ))}
                   </div>
                </div>

                {/* Text */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Review</label>
                    <textarea 
                        className="w-full h-32 p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-orange-500 outline-none resize-none font-medium text-gray-900"
                        placeholder="What did you order? How was the vibe? #Foodie"
                        value={draft.text}
                        onChange={(e) => setDraft(p => ({...p, text: e.target.value}))}
                    />
                </div>
             </div>
          </div>
        )}
      </div>

      {/* FOOTER ACTIONS */}
      {step === 3 && (
        <div className="p-4 bg-white border-t border-gray-100 safe-pb">
           <button 
             onClick={handlePost}
             disabled={isSubmitting || draft.rating === 0}
             className="w-full py-3.5 bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:shadow-none"
           >
              {isSubmitting ? (
                 <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                 <>
                   <Upload className="w-5 h-5" />
                   <span>Post Review</span>
                 </>
              )}
           </button>
        </div>
      )}
    </div>
  );
};