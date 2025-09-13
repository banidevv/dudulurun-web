'use client';

import { useState, useEffect } from 'react';

interface PaymentMethod {
    code: string;
    name: string;
    icon_url: string;
    fee_customer: {
        flat: number;
        percent: number;
    };
}

interface FormData {
    // Step 1
    category: 'fun' | 'family' | '';
    packageType: 'general' | 'community' | '';
    communityReferral: string;

    // Step 2   
    name: string;
    phone: string;
    email: string;
    shirtSize: string;
    customShirtSize: string;
    childShirtSize: string;
    customChildShirtSize: string;
    childAge: string;

    // Step 3
    paymentMethod: string;
}

interface ReferralCode {
    id: number;
    code: string;
    name: string;
    description?: string;
    discount: number;
    remainingClaims: number;
}

export const Registration = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
    const [validatingData, setValidatingData] = useState(false);
    const [validatingReferral, setValidatingReferral] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [validatedReferralCode, setValidatedReferralCode] = useState<ReferralCode | null>(null);
    const [referralError, setReferralError] = useState<string | null>(null);
    const [useCustomShirtSize, setUseCustomShirtSize] = useState(false);
    const [useCustomChildShirtSize, setUseCustomChildShirtSize] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        category: '',
        packageType: '',
        communityReferral: '',
        name: '',
        phone: '',
        email: '',
        shirtSize: '',
        customShirtSize: '',
        childShirtSize: '',
        customChildShirtSize: '',
        childAge: '',
        paymentMethod: ''
    });

    // Calculate price based on selection
    const calculatePrice = () => {
        if (formData.category === 'fun') {
            if (formData.packageType === 'general') return 225000;
            if (formData.packageType === 'community') {
                // For community package, price is always flat 195k when referral code is validated
                return 195000;
            }
        }
        if (formData.category === 'family') return 315000;
        return 0;
    };

    // Calculate original price (before any community pricing)
    const calculateOriginalPrice = () => {
        if (formData.category === 'fun') {
            // For community package, show what the general price would be
            if (formData.packageType === 'community') return 225000;
            if (formData.packageType === 'general') return 225000;
        }
        if (formData.category === 'family') return 315000;
        return 0;
    };

    // Fetch payment methods when reaching step 3
    useEffect(() => {
        if (currentStep === 3) {
            fetchPaymentMethods();
        }
    }, [currentStep]);

    const fetchPaymentMethods = async () => {
        setLoadingPaymentMethods(true);
        try {
            const amount = calculatePrice();
            console.log('Fetching payment methods for amount:', amount);
            const response = await fetch(`/api/payment-methods?amount=${amount}`);
            const data = await response.json();
            console.log('Payment methods response:', data);

            if (response.ok) {
                setPaymentMethods(data.data || []);
            } else {
                console.error('Failed to fetch payment methods:', data.error);
                setPaymentMethods([]);
            }
        } catch (error) {
            console.error('Error fetching payment methods:', error);
            setPaymentMethods([]);
        } finally {
            setLoadingPaymentMethods(false);
        }
    };

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear referral validation when code changes
        if (field === 'communityReferral') {
            setValidatedReferralCode(null);
            setReferralError(null);
        }
    };

    // Validate referral code
    const validateReferralCode = async (code: string, category: string) => {
        if (!code.trim()) {
            setReferralError(null);
            setValidatedReferralCode(null);
            return;
        }

        setValidatingReferral(true);
        setReferralError(null);

        try {
            const response = await fetch('/api/validate-referral', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: code.trim(),
                    category: category,
                }),
            });

            const data = await response.json();

            if (response.ok && data.valid) {
                setValidatedReferralCode(data.referralCode);
                setReferralError(null);
            } else {
                setReferralError(data.error || 'Kode referral tidak valid');
                setValidatedReferralCode(null);
            }
        } catch (error) {
            console.error('Error validating referral code:', error);
            setReferralError('Terjadi kesalahan saat memvalidasi kode referral');
            setValidatedReferralCode(null);
        } finally {
            setValidatingReferral(false);
        }
    };

    const nextStep = async () => {
        // Set loading state for step 1 validation (referral code validation)
        if (currentStep === 1 && formData.packageType === 'community') {
            setValidatingReferral(true);
        }

        try {
            if (await validateCurrentStep()) {
                setCurrentStep(prev => prev + 1);
            }
        } finally {
            if (currentStep === 1 && formData.packageType === 'community') {
                setValidatingReferral(false);
            }
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => prev - 1);
    };

    const validateCurrentStep = async () => {
        switch (currentStep) {
            case 1:
                if (!formData.category) {
                    alert('Pilih kategori lomba terlebih dahulu');
                    return false;
                }
                if (formData.category === 'fun' && !formData.packageType) {
                    alert('Pilih jenis paket terlebih dahulu');
                    return false;
                }
                if (formData.packageType === 'community' && !formData.communityReferral) {
                    alert('Masukkan kode referral community terlebih dahulu');
                    return false;
                }

                // Validate referral code if provided - always re-validate to ensure availability
                if (formData.packageType === 'community' && formData.communityReferral) {
                    // Re-validate referral code to ensure it's still available
                    await validateReferralCode(formData.communityReferral, formData.category);

                    // Check if validation failed
                    if (referralError || !validatedReferralCode) {
                        alert(referralError || 'Kode referral tidak valid atau sudah tidak tersedia');
                        return false;
                    }

                    // Double-check remaining claims
                    if (validatedReferralCode.remainingClaims <= 0) {
                        alert('Kode referral sudah tidak tersedia (sudah mencapai batas maksimal)');
                        return false;
                    }
                }
                return true;
            case 2:
                if (!formData.name || !formData.phone || !formData.email) {
                    alert('Lengkapi semua data biodata terlebih dahulu');
                    return false;
                }
                // Validate shirt size (either standard or custom)
                if (!formData.shirtSize && !formData.customShirtSize) {
                    alert('Pilih ukuran jersey atau masukkan ukuran kustom terlebih dahulu');
                    return false;
                }
                if (formData.category === 'family') {
                    if (!formData.childShirtSize && !formData.customChildShirtSize) {
                        alert('Pilih ukuran jersey anak atau masukkan ukuran kustom terlebih dahulu');
                        return false;
                    }
                    if (!formData.childAge) {
                        alert('Masukkan umur anak terlebih dahulu');
                        return false;
                    }
                    const childAgeNum = parseInt(formData.childAge);
                    if (isNaN(childAgeNum) || childAgeNum < 7 || childAgeNum > 13) {
                        alert('Umur anak harus antara 7-13 tahun');
                        return false;
                    }
                }

                // Validate email and phone before proceeding
                setValidatingData(true);
                try {
                    // // const response = await fetch('/api/validate-registration', {
                    // //     method: 'POST',
                    // //     headers: {
                    // //         'Content-Type': 'application/json',
                    // //     },
                    // //     body: JSON.stringify({
                    // //         email: formData.email,
                    // //         phone: formData.phone,
                    // //     }),
                    // // });

                    // const data = await response.json();

                    // if (!response.ok) {
                    //     alert(data.error || 'Terjadi kesalahan saat memvalidasi data');
                    //     return false;
                    // }

                    return true;
                } catch (error) {
                    console.error('Validation error:', error);
                    alert('Terjadi kesalahan saat memvalidasi data. Silakan coba lagi.');
                    return false;
                } finally {
                    setValidatingData(false);
                }
            case 3:
                if (!formData.paymentMethod) {
                    alert('Pilih metode pembayaran terlebih dahulu');
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    const handleSubmit = async () => {
        if (!(await validateCurrentStep())) return;

        setLoading(true);
        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                category: formData.category,
                packageType: formData.packageType,
                shirtSize: formData.shirtSize,
                customShirtSize: formData.customShirtSize,
                customChildShirtSize: formData.customChildShirtSize,
                childAge: formData.childAge ? parseInt(formData.childAge) : undefined,
                method: formData.paymentMethod,
                // Use new referral code system
                referralCodeId: validatedReferralCode?.id || undefined,
                // Keep legacy voucher code for backward compatibility
                voucherCode: formData.communityReferral || undefined,
                ...(formData.category === 'family' && {
                    familyPackage: {
                        parentCount: 1,
                        childCount: 1,
                        parentPackageType: 'parentFull',
                        childPackageType: 'childFull',
                        parentShirtSizes: formData.shirtSize || formData.customShirtSize,
                        childShirtSizes: formData.childShirtSize || formData.customChildShirtSize
                    }
                })
            };

            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            console.log("Register Response: ", data);

            if (response.ok && data.payment) {
                window.location.href = data.payment.payment_url;
            } else {
                alert(data.error || 'Terjadi kesalahan saat mendaftar');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Terjadi kesalahan saat mendaftar');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    return (
        <section id="registrasi" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-primary to-teal-700 text-white">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="text-center mb-8 sm:mb-12">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">Daftar Sekarang</h2>
                </div>

                <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-2xl p-4 sm:p-6 lg:p-8 text-gray-900">
                    {/* Progress Steps */}
                    <div className="flex justify-between items-center mb-6 sm:mb-8">
                        {[1, 2, 3].map((step) => (
                            <div key={step} className="flex items-center flex-1">
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm sm:text-base ${currentStep >= step ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {step}
                                </div>
                                <div className={`ml-2 sm:ml-3 text-xs sm:text-sm ${currentStep >= step ? 'text-primary' : 'text-gray-500'} hidden sm:block`}>
                                    {step === 1 && 'Pilih Kategori'}
                                    {step === 2 && 'Biodata'}
                                    {step === 3 && 'Pembayaran'}
                                </div>
                                {step < 3 && <div className={`w-8 sm:w-16 h-0.5 ml-2 sm:ml-4 ${currentStep > step ? 'bg-primary' : 'bg-gray-200'
                                    }`} />}
                            </div>
                        ))}
                    </div>

                    {/* Step 1: Category Selection */}
                    {currentStep === 1 && (
                        <div className="space-y-4 sm:space-y-6">
                            <h3 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">Pilih Kategori Lomba</h3>

                            {/* Category Selection */}
                            <div className="space-y-3 sm:space-y-4">
                                <div className={`border-2 rounded-lg p-3 sm:p-4 cursor-pointer transition-colors touch-manipulation ${formData.category === 'fun' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'
                                    }`} onClick={() => handleInputChange('category', 'fun')}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-base sm:text-lg">Fun Run 5K</h4>
                                            <p className="text-gray-600 text-sm sm:text-base">Lari santai 5 kilometer</p>
                                        </div>
                                        <input
                                            type="radio"
                                            name="category"
                                            value="fun"
                                            checked={formData.category === 'fun'}
                                            onChange={() => handleInputChange('category', 'fun')}
                                            className="w-4 h-4 text-primary ml-2"
                                        />
                                    </div>
                                </div>

                                <div className={`border-2 rounded-lg p-3 sm:p-4 cursor-pointer transition-colors touch-manipulation ${formData.category === 'family' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'
                                    }`} onClick={() => handleInputChange('category', 'family')}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-base sm:text-lg">Family Run 2.5K</h4>
                                            <p className="text-gray-600 text-sm sm:text-base">Lari keluarga 2.5 kilometer</p>
                                            <p className="text-primary font-semibold text-sm sm:text-base">{formatPrice(315000)}</p>
                                        </div>
                                        <input
                                            type="radio"
                                            name="category"
                                            value="family"
                                            checked={formData.category === 'family'}
                                            onChange={() => handleInputChange('category', 'family')}
                                            className="w-4 h-4 text-primary ml-2"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Fun Run Package Type */}
                            {formData.category === 'fun' && (
                                <div className="space-y-4 mt-6">
                                    <h4 className="font-semibold">Pilih Jenis Paket:</h4>

                                    <div className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${formData.packageType === 'general' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'
                                        }`} onClick={() => handleInputChange('packageType', 'general')}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h5 className="font-semibold">Umum</h5>
                                                <p className="text-primary font-semibold">{formatPrice(225000)}</p>
                                            </div>
                                            <input
                                                type="radio"
                                                name="packageType"
                                                value="general"
                                                checked={formData.packageType === 'general'}
                                                onChange={() => handleInputChange('packageType', 'general')}
                                                className="w-4 h-4 text-primary"
                                            />
                                        </div>
                                    </div>

                                    <div className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${formData.packageType === 'community' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'
                                        }`} onClick={() => handleInputChange('packageType', 'community')}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h5 className="font-semibold">Community</h5>
                                                <p className="text-primary font-semibold">{formatPrice(195000)}</p>
                                            </div>
                                            <input
                                                type="radio"
                                                name="packageType"
                                                value="community"
                                                checked={formData.packageType === 'community'}
                                                onChange={() => handleInputChange('packageType', 'community')}
                                                className="w-4 h-4 text-primary"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Community Referral */}
                            {formData.packageType === 'community' && (
                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Kode Referral Community *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={formData.communityReferral}
                                            onChange={(e) => handleInputChange('communityReferral', e.target.value)}
                                            onBlur={() => {
                                                if (formData.communityReferral && formData.category) {
                                                    validateReferralCode(formData.communityReferral, formData.category);
                                                }
                                            }}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${referralError
                                                ? 'border-red-300 focus:ring-red-500'
                                                : validatedReferralCode
                                                    ? 'border-green-300 focus:ring-green-500'
                                                    : 'border-gray-300 focus:ring-primary'
                                                }`}
                                            placeholder="Masukkan kode referral"
                                            required
                                        />
                                        {validatingReferral && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                            </div>
                                        )}
                                    </div>

                                    {referralError && (
                                        <p className="mt-2 text-sm text-red-600">{referralError}</p>
                                    )}

                                    {validatedReferralCode && (
                                        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <p className="text-sm text-green-800 font-medium">
                                                ✓ {validatedReferralCode.name}
                                            </p>
                                            {validatedReferralCode.description && (
                                                <p className="text-sm text-green-600">{validatedReferralCode.description}</p>
                                            )}
                                            <p className="text-sm text-green-700">
                                                Harga Community: {formatPrice(195000)} •
                                                Tersisa: {validatedReferralCode.remainingClaims} klaim
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={nextStep}
                                disabled={validatingReferral}
                                className="w-full bg-primary text-white py-3 sm:py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 touch-manipulation"
                            >
                                {validatingReferral && formData.packageType === 'community' ? (
                                    <div className="flex items-center justify-center">
                                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Memvalidasi Kode Referral...
                                    </div>
                                ) : (
                                    'Lanjut ke Biodata'
                                )}
                            </button>
                        </div>
                    )}

                    {/* Step 2: Biodata */}
                    {currentStep === 2 && (
                        <div className="space-y-4 sm:space-y-6">
                            <h3 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">Isi Biodata</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Lengkap Pendaftar {formData.category === 'family' ? '(Nama Orang Tua)' : ''}*
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="Masukkan nama lengkap"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="nama@email.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nomor Telepon *
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="08xxxxxxxxxx"
                                    required
                                />
                            </div>

                            {/* Jersey Size */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ukuran Jersey {formData.category === 'family' ? '(Dewasa)' : ''} *
                                </label>
                                <div className="grid grid-cols-5 gap-2 sm:gap-3 mb-3">
                                    {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                                        <label
                                            key={size}
                                            className={`flex items-center justify-center p-2 sm:p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors touch-manipulation ${formData.shirtSize === size && !useCustomShirtSize
                                                ? 'bg-primary text-white border-primary'
                                                : 'border-gray-300'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="shirtSize"
                                                value={size}
                                                checked={formData.shirtSize === size && !useCustomShirtSize}
                                                onChange={(e) => {
                                                    handleInputChange('shirtSize', e.target.value);
                                                    setUseCustomShirtSize(false);
                                                    setFormData(prev => ({ ...prev, customShirtSize: '' }));
                                                }}
                                                className="sr-only"
                                            />
                                            <span className="font-medium text-sm sm:text-base">{size}</span>
                                        </label>
                                    ))}
                                </div>

                                {/* Custom Size Option */}
                                <div className="flex items-center space-x-3">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="shirtSize"
                                            checked={useCustomShirtSize}
                                            onChange={() => {
                                                setUseCustomShirtSize(true);
                                                setFormData(prev => ({ ...prev, shirtSize: '' }));
                                            }}
                                            className="w-4 h-4 text-primary"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Ukuran Kustom</span>
                                    </label>
                                </div>

                                {useCustomShirtSize && (
                                    <div className="mt-3">
                                        <input
                                            type="text"
                                            value={formData.customShirtSize}
                                            onChange={(e) => handleInputChange('customShirtSize', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="Masukkan ukuran jersey kustom (contoh: XXL, 3XL, dll)"
                                            required
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Child Jersey Size for Family Run */}
                            {formData.category === 'family' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ukuran Jersey Anak *
                                    </label>
                                    <div className="grid grid-cols-5 gap-3 mb-3">
                                        {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                                            <label
                                                key={size}
                                                className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${formData.childShirtSize === size && !useCustomChildShirtSize
                                                    ? 'bg-primary text-white border-primary'
                                                    : 'border-gray-300'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="childShirtSize"
                                                    value={size}
                                                    checked={formData.childShirtSize === size && !useCustomChildShirtSize}
                                                    onChange={(e) => {
                                                        handleInputChange('childShirtSize', e.target.value);
                                                        setUseCustomChildShirtSize(false);
                                                        setFormData(prev => ({ ...prev, customChildShirtSize: '' }));
                                                    }}
                                                    className="sr-only"
                                                />
                                                <span className="font-medium">{size}</span>
                                            </label>
                                        ))}
                                    </div>

                                    {/* Custom Child Size Option */}
                                    <div className="flex items-center space-x-3 mb-3">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="childShirtSize"
                                                checked={useCustomChildShirtSize}
                                                onChange={() => {
                                                    setUseCustomChildShirtSize(true);
                                                    setFormData(prev => ({ ...prev, childShirtSize: '' }));
                                                }}
                                                className="w-4 h-4 text-primary"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Ukuran Kustom</span>
                                        </label>
                                    </div>

                                    {useCustomChildShirtSize && (
                                        <div className="mb-4">
                                            <input
                                                type="text"
                                                value={formData.customChildShirtSize}
                                                onChange={(e) => handleInputChange('customChildShirtSize', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="Masukkan ukuran jersey anak kustom (contoh: XXL, 3XL, dll)"
                                                required
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Child Age for Family Run */}
                            {formData.category === 'family' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Umur Anak *
                                    </label>
                                    <input
                                        type="number"
                                        min="7"
                                        max="13"
                                        value={formData.childAge}
                                        onChange={(e) => handleInputChange('childAge', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="Masukkan umur anak (7-13 tahun)"
                                        required
                                    />
                                    <p className="mt-1 text-sm text-gray-500">Umur anak harus antara 7-13 tahun</p>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                <button
                                    onClick={prevStep}
                                    disabled={validatingData}
                                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors disabled:opacity-50 touch-manipulation"
                                >
                                    Kembali
                                </button>
                                <button
                                    onClick={nextStep}
                                    disabled={validatingData}
                                    className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 touch-manipulation"
                                >
                                    {validatingData ? (
                                        <div className="flex items-center justify-center">
                                            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Memvalidasi...
                                        </div>
                                    ) : (
                                        'Lanjut ke Pembayaran'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Payment Method */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-center mb-6">Pilih Metode Pembayaran</h3>

                            {/* Price Summary */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                {formData.packageType === 'community' && validatedReferralCode ? (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Harga Normal (Umum):</span>
                                            <span className="text-gray-600 line-through">{formatPrice(calculateOriginalPrice())}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-green-600 font-medium">Harga Community ({validatedReferralCode.name}):</span>
                                            <span className="text-green-600 font-medium">{formatPrice(195000)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-green-600 font-medium">Hemat:</span>
                                            <span className="text-green-600 font-medium">{formatPrice(calculateOriginalPrice() - 195000)}</span>
                                        </div>
                                        <hr className="border-gray-300" />
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold">Total Pembayaran:</span>
                                            <span className="text-2xl font-bold text-primary">{formatPrice(calculatePrice())}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">Total Pembayaran:</span>
                                        <span className="text-2xl font-bold text-primary">{formatPrice(calculatePrice())}</span>
                                    </div>
                                )}
                            </div>

                            {/* Payment Methods */}
                            <div className="space-y-3">
                                {loadingPaymentMethods ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        <p className="mt-2 text-gray-600">Memuat metode pembayaran...</p>
                                    </div>
                                ) : paymentMethods.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-600">Tidak ada metode pembayaran tersedia</p>
                                        <button
                                            onClick={fetchPaymentMethods}
                                            className="mt-2 text-primary hover:underline"
                                        >
                                            Coba lagi
                                        </button>
                                    </div>
                                ) : (
                                    paymentMethods.map((method) => (
                                        <div
                                            key={method.code}
                                            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${formData.paymentMethod === method.code
                                                ? 'border-primary bg-primary/5'
                                                : 'border-gray-200 hover:border-primary/50'
                                                }`}
                                            onClick={() => handleInputChange('paymentMethod', method.code)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <img
                                                        src={method.icon_url}
                                                        alt={method.name}
                                                        className="w-8 h-8 object-contain"
                                                    />
                                                    <span className="font-medium">{method.name}</span>
                                                </div>
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value={method.code}
                                                    checked={formData.paymentMethod === method.code}
                                                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                                                    className="w-4 h-4 text-primary"
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                <button
                                    onClick={prevStep}
                                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors touch-manipulation"
                                >
                                    Kembali
                                </button>
                                <button
                                    onClick={() => setShowConfirmation(true)}
                                    className="flex-1 bg-accent text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors touch-manipulation"
                                >
                                    Konfirmasi & Bayar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Confirmation Modal */}
                    {showConfirmation && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                                <h3 className="text-xl font-bold mb-4">Konfirmasi Pendaftaran</h3>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span>Kategori:</span>
                                        <span className="font-semibold">
                                            {formData.category === 'fun' ? 'Fun Run 5K' : 'Family Run 2.5K'}
                                            {formData.category === 'fun' && ` - ${formData.packageType === 'general' ? 'Umum' : 'Community'}`}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span>Nama:</span>
                                        <span className="font-semibold">{formData.name}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span>Email:</span>
                                        <span className="font-semibold">{formData.email}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span>Telepon:</span>
                                        <span className="font-semibold">{formData.phone}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span>Ukuran Jersey:</span>
                                        <span className="font-semibold">
                                            {formData.shirtSize || formData.customShirtSize}
                                            {formData.category === 'family' && ` (Dewasa), ${formData.childShirtSize || formData.customChildShirtSize} (Anak)`}
                                        </span>
                                    </div>

                                    {formData.category === 'family' && formData.childAge && (
                                        <div className="flex justify-between">
                                            <span>Umur Anak:</span>
                                            <span className="font-semibold">{formData.childAge} tahun</span>
                                        </div>
                                    )}

                                    {formData.communityReferral && (
                                        <div className="flex justify-between">
                                            <span>Kode Referral:</span>
                                            <span className="font-semibold">{formData.communityReferral}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between">
                                        <span>Metode Pembayaran:</span>
                                        <span className="font-semibold">
                                            {paymentMethods.find(method => method.code === formData.paymentMethod)?.name || formData.paymentMethod}
                                        </span>
                                    </div>

                                    <div className="flex justify-between border-t pt-3">
                                        <span>Total Pembayaran:</span>
                                        <span className="font-bold text-primary">{formatPrice(calculatePrice())}</span>
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-6">
                                    <button
                                        onClick={() => setShowConfirmation(false)}
                                        className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="flex-1 bg-accent text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? 'Memproses...' : 'Konfirmasi'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}; 