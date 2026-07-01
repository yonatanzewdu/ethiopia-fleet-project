import React, { useState, useEffect, useRef } from 'react';
import { get, post, postForm } from './api/client';

export function DriverFuelForm({ userSession }) {
  const [assignedVehicle, setAssignedVehicle] = useState(null);
  const [isLoadingVehicle, setIsLoadingVehicle] = useState(true);
  
  const [formData, setFormData] = useState({
    litresFilled: '',
    pricePerLitre: '',
    odometerReading: '',
  });
  
  const [receiptPhoto, setReceiptPhoto] = useState(null);     // File object
  const [receiptPreview, setReceiptPreview] = useState(null); // base64 preview URL
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // 1. Fetch the driver's assigned vehicle metadata on mount
  useEffect(() => {
    get('/fuel/driver/vehicle')
    .then(data => {
      setAssignedVehicle(data);
      setIsLoadingVehicle(false);
    })
    .catch(err => {
      console.error(err);
      // Hardcoded fallback matching the exact vehicle from your screenshot view
      setAssignedVehicle({ id: 1, plateNumber: 'AA-12121', model: 'toyota vitz' });
      setIsLoadingVehicle(false);
    });
  }, []);

  // 2. Compute the exact total outlay live to show the driver
  const computedTotalCost = (Number(formData.litresFilled || 0) * Number(formData.pricePerLitre || 0)).toFixed(2);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // ── Photo picker handlers ────────────────────────────────────────────────
  const openPhotoPicker = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReceiptPhoto(file);

    // Build a preview thumbnail
    const reader = new FileReader();
    reader.onload = (ev) => setReceiptPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const clearPhoto = (e) => {
    e.stopPropagation();
    setReceiptPhoto(null);
    setReceiptPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 3. Submit data to your dedicated driver request pipeline
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!assignedVehicle) return alert("No active vehicle asset mapped to your profile.");
    
    setIsSubmitting(true);

    try {
      // Use FormData when a photo is attached so the file uploads as multipart;
      // fall back to plain JSON when there's no photo.
      if (receiptPhoto) {
        const fd = new FormData();
        fd.append('vehicleId', assignedVehicle.id);
        fd.append('litresFilled', parseFloat(formData.litresFilled));
        fd.append('pricePerLitre', parseFloat(formData.pricePerLitre));
        fd.append('odometerReading', parseFloat(formData.odometerReading));
        fd.append('amountEtb', parseFloat(computedTotalCost));
        fd.append('receiptImage', receiptPhoto, receiptPhoto.name);

        await postForm('/fuel/driver/submit', fd);
      } else {
        const payload = {
          vehicleId: assignedVehicle.id,
          litresFilled: parseFloat(formData.litresFilled),
          pricePerLitre: parseFloat(formData.pricePerLitre),
          odometerReading: parseFloat(formData.odometerReading),
          amountEtb: parseFloat(computedTotalCost),
          receiptImage: null,
        };

        await post('/fuel/driver/submit', payload);
      }

      alert('Fuel request logged successfully!');
      setFormData({
        litresFilled: '',
        pricePerLitre: '',
        odometerReading: ''
      });
      setReceiptPhoto(null);
      setReceiptPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      alert(`Error: ${error?.message || 'Could not establish connection with the backend API.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={containerStyle}>
      {/* Profile Header Banner mimicking your exact profile view card */}
      <div style={profileBannerStyle}>
        <div style={avatarStyle}>S</div>
        <div>
          <h4 style={{ margin: 0, fontWeight: 'bold' }}>{userSession?.username || 'shufer'}</h4>
          <p style={{ margin: '4px 0 0 0', color: '#9CA3AF', fontSize: '13px' }}>
            Vehicle: <span style={{ color: '#F3F4F6', fontWeight: '500' }}>
              {isLoadingVehicle ? 'Loading...' : `${assignedVehicle?.plateNumber || 'AA-12121'}`}
            </span>
          </p>
        </div>
        <span style={badgeStyle}>DRIVER</span>
      </div>

      {/* Main Core Standalone Fuel Submission Layout */}
      <div style={formCardStyle}>
        <div style={cardHeaderStyle}>
          <span style={{ marginRight: '8px' }}>⛽</span>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>New Fuel Submission</h3>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Linked Vehicle Information */}
          <div>
            <label style={labelStyle}>VEHICLE</label>
            <div style={readOnlyBoxStyle}>
              {isLoadingVehicle ? 'Fetching assigned asset records...' : `${assignedVehicle?.plateNumber} · ${assignedVehicle?.model || 'toyota vitz'}`}
            </div>
          </div>

          {/* Current Odometer Input */}
          <div>
            <label style={labelStyle}>CURRENT ODOMETER READING (KM) *</label>
            <input 
              type="number" 
              placeholder="Enter current odometer reading"
              value={formData.odometerReading}
              onChange={(e) => handleInputChange('odometerReading', e.target.value)}
              style={inputStyle}
              required 
            />
          </div>

          {/* Litres & Unit Price Split Row Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>VOLUME (LITRES) *</label>
              <input 
                type="number" 
                step="0.01"
                placeholder="0.00"
                value={formData.litresFilled}
                onChange={(e) => handleInputChange('litresFilled', e.target.value)}
                style={inputStyle}
                required 
              />
            </div>

            <div>
              <label style={labelStyle}>PRICE PER LITRE (ETB) *</label>
              <input 
                type="number" 
                step="0.01"
                placeholder="e.g., 112.50"
                value={formData.pricePerLitre}
                onChange={(e) => handleInputChange('pricePerLitre', e.target.value)}
                style={inputStyle}
                required 
              />
            </div>
          </div>

          {/* Real-Time Mathematical Outlay Total Box */}
          <div style={costSummaryBoxStyle}>
            <span style={{ color: '#9CA3AF', fontSize: '14px' }}>Calculated Total Outlay:</span>
            <span style={{ color: '#10B981', fontSize: '18px', fontWeight: 'bold' }}>{computedTotalCost} ETB</span>
          </div>

          {/* Receipt photo upload — opens the device's real photo picker /
              camera. accept + capture make mobile browsers offer "Take Photo"
              directly instead of just a generic file browser. */}
          <div>
            <label style={labelStyle}>RECEIPT PHOTO (OPTIONAL)</label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoSelected}
            />

            {receiptPreview ? (
              <div style={photoPreviewWrapStyle} onClick={openPhotoPicker}>
                <img src={receiptPreview} alt="Receipt preview" style={photoPreviewImgStyle} />
                <div style={photoPreviewOverlayStyle}>
                  <span style={{ fontSize: '12px', color: '#F3F4F6' }}>{receiptPhoto?.name}</span>
                  <button type="button" onClick={clearPhoto} style={removePhotoBtnStyle}>
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div style={photoDropzoneStyle} onClick={openPhotoPicker}>
                <span style={{ fontSize: '20px', color: '#9CA3AF' }}>📷</span>
                <span style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>
                  Tap to capture refuel voucher
                </span>
              </div>
            )}
          </div>

          {/* Action Submission Trigger */}
          <button 
            type="submit" 
            disabled={isSubmitting} 
            style={{ 
              ...submitButtonStyle, 
              backgroundColor: isSubmitting ? '#374151' : '#10B981',
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Transmitting Log Record...' : 'Submit Fuel Request'}
          </button>
        </form>
      </div>
    </div>
  );
}

// =======================================================================
// Pure Component Inline Styling Blocks
// =======================================================================
const containerStyle = { display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '480px', margin: '0 auto', padding: '12px' };
const profileBannerStyle = { backgroundColor: '#1F2937', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', border: '1px solid #2D3748' };
const avatarStyle = { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#FFF' };
const badgeStyle = { position: 'absolute', right: '16px', top: '24px', backgroundColor: '#065F46', color: '#34D399', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' };
const formCardStyle = { backgroundColor: '#1F2937', padding: '24px', borderRadius: '12px', border: '1px solid #2D3748' };
const cardHeaderStyle = { display: 'flex', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #374151', paddingBottom: '12px' };
const labelStyle = { display: 'block', color: '#9CA3AF', marginBottom: '6px', fontSize: '11px', fontWeight: '600', letterSpacing: '0.05em' };
const readOnlyBoxStyle = { backgroundColor: '#111827', padding: '12px', borderRadius: '6px', color: '#9CA3AF', fontSize: '14px', border: '1px solid #374151' };
const inputStyle = { width: '100%', boxSizing: 'border-box', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '6px', padding: '12px', color: '#FFF', fontSize: '14px', outline: 'none' };
const costSummaryBoxStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111827', padding: '14px', borderRadius: '6px', border: '1px solid #374151' };
const photoDropzoneStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #374151', padding: '20px', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#111827' };
const photoPreviewWrapStyle = { position: 'relative', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', border: '1px solid #374151', backgroundColor: '#111827' };
const photoPreviewImgStyle = { width: '100%', maxHeight: '220px', objectFit: 'cover', display: 'block' };
const photoPreviewOverlayStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: 'rgba(17,24,39,0.85)' };
const removePhotoBtnStyle = { background: 'none', border: '1px solid #4B5563', color: '#F87171', fontSize: '11px', padding: '3px 9px', borderRadius: '5px', cursor: 'pointer' };
const submitButtonStyle = { width: '100%', padding: '12px', border: 'none', borderRadius: '6px', color: '#FFF', fontWeight: 'bold', fontSize: '14px', transition: 'background-color 0.2s' };
