import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Badge } from './ui/Badge';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  Send,
  User,
  Building2,
  FileText,
  CheckCircle
} from 'lucide-react';
import { getCarriers, createDropTicket } from '../services/api';
import { Carrier, ProductType } from '../types';
import { CreateDropTicketRequest } from '../types/DTOs';

interface CreateExchangeProps {
  onNavigate?: (page: string, data?: any) => void;
}

export const CreateExchange: React.FC<CreateExchangeProps> = ({ onNavigate }) => {
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<CreateDropTicketRequest>>({
    targetProductType: 'annuity',
    sourceAccounts: [
      {
        accountNumber: '',
        carrierId: '',
        accountType: 'life_insurance',
        productName: '',
        currentValue: 0,
        surrenderValue: 0,
        outstandingLoans: 0
      }
    ],
    owner: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: {
        line1: '',
        city: '',
        state: '',
        zipCode: ''
      }
    },
    insured: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      relationshipToOwner: 'self'
    },
    agent: {
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadCarriers = async () => {
      try {
        const carriersData = await getCarriers();
        setCarriers(carriersData);
      } catch (error) {
        console.error('Error loading carriers:', error);
      }
    };
    loadCarriers();
  }, []);

  const carrierOptions = carriers.map(carrier => ({
    value: carrier.id,
    label: `${carrier.name} (${carrier.code})`
  }));

  const productTypeOptions = [
    { value: 'life_insurance', label: 'Life Insurance' },
    { value: 'annuity', label: 'Annuity' }
  ];

  const relationshipOptions = [
    { value: 'self', label: 'Self' },
    { value: 'spouse', label: 'Spouse' },
    { value: 'child', label: 'Child' },
    { value: 'other', label: 'Other' }
  ];

  const stateOptions = [
    { value: 'CA', label: 'California' },
    { value: 'NY', label: 'New York' },
    { value: 'TX', label: 'Texas' },
    { value: 'FL', label: 'Florida' },
    { value: 'IL', label: 'Illinois' }
  ];

  const addSourceAccount = () => {
    setFormData(prev => ({
      ...prev,
      sourceAccounts: [
        ...(prev.sourceAccounts || []),
        {
          accountNumber: '',
          carrierId: '',
          accountType: 'life_insurance',
          productName: '',
          currentValue: 0,
          surrenderValue: 0,
          outstandingLoans: 0
        }
      ]
    }));
  };

  const removeSourceAccount = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sourceAccounts: prev.sourceAccounts?.filter((_, i) => i !== index)
    }));
  };

  const updateSourceAccount = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      sourceAccounts: prev.sourceAccounts?.map((account, i) => 
        i === index ? { ...account, [field]: value } : account
      )
    }));
  };

  const updateFormData = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const updateNestedFormData = (section: string, subsection: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [subsection]: {
          ...(prev[section as keyof typeof prev] as any)?.[subsection],
          [field]: value
        }
      }
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.targetCarrierId) newErrors.targetCarrierId = 'Target carrier is required';
        if (!formData.targetProductType) newErrors.targetProductType = 'Target product type is required';
        break;
      case 2:
        if (!formData.owner?.firstName) newErrors.ownerFirstName = 'First name is required';
        if (!formData.owner?.lastName) newErrors.ownerLastName = 'Last name is required';
        if (!formData.owner?.email) newErrors.ownerEmail = 'Email is required';
        break;
      case 3:
        if (!formData.insured?.firstName) newErrors.insuredFirstName = 'First name is required';
        if (!formData.insured?.lastName) newErrors.insuredLastName = 'Last name is required';
        if (!formData.insured?.dateOfBirth) newErrors.insuredDateOfBirth = 'Date of birth is required';
        break;
      case 4:
        if (!formData.agent?.firstName) newErrors.agentFirstName = 'First name is required';
        if (!formData.agent?.lastName) newErrors.agentLastName = 'Last name is required';
        if (!formData.agent?.email) newErrors.agentEmail = 'Email is required';
        break;
      case 5:
        formData.sourceAccounts?.forEach((account, index) => {
          if (!account.accountNumber) newErrors[`account${index}Number`] = 'Account number is required';
          if (!account.carrierId) newErrors[`account${index}Carrier`] = 'Carrier is required';
        });
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    setLoading(true);
    try {
      const dropTicket = await createDropTicket(
        formData as CreateDropTicketRequest,
        'current-user-id' // In real app, get from auth context
      );
      
      setCurrentStep(6); // Success step
      setTimeout(() => {
        onNavigate?.('exchange-detail', { id: dropTicket.id });
      }, 2000);
    } catch (error) {
      console.error('Error creating drop ticket:', error);
      setErrors({ submit: 'Failed to create exchange. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Exchange Details', icon: FileText },
    { number: 2, title: 'Policy Owner', icon: User },
    { number: 3, title: 'Insured Party', icon: User },
    { number: 4, title: 'Agent Information', icon: User },
    { number: 5, title: 'Source Policies', icon: Building2 },
    { number: 6, title: 'Review & Submit', icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onNavigate?.('dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-xl font-semibold text-slate-900">Create New Exchange</h1>
            </div>
            <Badge variant="info" size="sm">Step {currentStep} of 6</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200
                  ${currentStep >= step.number 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'bg-white border-slate-300 text-slate-400'
                  }
                `}>
                  <step.icon className="w-5 h-5" />
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    w-16 h-0.5 mx-2 transition-all duration-200
                    ${currentStep > step.number ? 'bg-blue-500' : 'bg-slate-300'}
                  `} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map(step => (
              <div key={step.number} className="text-center">
                <p className={`
                  text-sm font-medium transition-colors duration-200
                  ${currentStep >= step.number ? 'text-blue-600' : 'text-slate-500'}
                `}>
                  {step.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <Card>
          <CardContent className="p-8">
            {/* Step 1: Exchange Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Exchange Details</h2>
                  <p className="text-slate-600">Define the target product and carrier for this 1035 exchange.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Select
                    label="Target Carrier"
                    options={carrierOptions}
                    value={formData.targetCarrierId || ''}
                    onChange={(e) => updateFormData('', 'targetCarrierId', e.target.value)}
                    error={errors.targetCarrierId}
                    placeholder="Select target carrier"
                  />

                  <Select
                    label="Target Product Type"
                    options={productTypeOptions}
                    value={formData.targetProductType || ''}
                    onChange={(e) => updateFormData('', 'targetProductType', e.target.value as ProductType)}
                    error={errors.targetProductType}
                  />
                </div>

                <Input
                  label="Estimated Total Value (Optional)"
                  type="number"
                  value={formData.estimatedValue || ''}
                  onChange={(e) => updateFormData('', 'estimatedValue', parseFloat(e.target.value) || undefined)}
                  placeholder="Enter estimated value"
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes || ''}
                    onChange={(e) => updateFormData('', 'notes', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add any special instructions or notes..."
                  />
                </div>
              </div>
            )}

            {/* Step 2: Policy Owner */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Policy Owner Information</h2>
                  <p className="text-slate-600">Enter the details of the policy owner.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="First Name"
                    value={formData.owner?.firstName || ''}
                    onChange={(e) => updateFormData('owner', 'firstName', e.target.value)}
                    error={errors.ownerFirstName}
                    placeholder="Enter first name"
                  />

                  <Input
                    label="Last Name"
                    value={formData.owner?.lastName || ''}
                    onChange={(e) => updateFormData('owner', 'lastName', e.target.value)}
                    error={errors.ownerLastName}
                    placeholder="Enter last name"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="Email"
                    type="email"
                    value={formData.owner?.email || ''}
                    onChange={(e) => updateFormData('owner', 'email', e.target.value)}
                    error={errors.ownerEmail}
                    placeholder="Enter email address"
                  />

                  <Input
                    label="Phone"
                    type="tel"
                    value={formData.owner?.phone || ''}
                    onChange={(e) => updateFormData('owner', 'phone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Address</h3>
                  
                  <Input
                    label="Street Address"
                    value={formData.owner?.address?.line1 || ''}
                    onChange={(e) => updateNestedFormData('owner', 'address', 'line1', e.target.value)}
                    placeholder="Enter street address"
                  />

                  <div className="grid md:grid-cols-3 gap-4">
                    <Input
                      label="City"
                      value={formData.owner?.address?.city || ''}
                      onChange={(e) => updateNestedFormData('owner', 'address', 'city', e.target.value)}
                      placeholder="Enter city"
                    />

                    <Select
                      label="State"
                      options={stateOptions}
                      value={formData.owner?.address?.state || ''}
                      onChange={(e) => updateNestedFormData('owner', 'address', 'state', e.target.value)}
                      placeholder="Select state"
                    />

                    <Input
                      label="ZIP Code"
                      value={formData.owner?.address?.zipCode || ''}
                      onChange={(e) => updateNestedFormData('owner', 'address', 'zipCode', e.target.value)}
                      placeholder="Enter ZIP code"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Insured Party */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Insured Party Information</h2>
                  <p className="text-slate-600">Enter the details of the insured party.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="First Name"
                    value={formData.insured?.firstName || ''}
                    onChange={(e) => updateFormData('insured', 'firstName', e.target.value)}
                    error={errors.insuredFirstName}
                    placeholder="Enter first name"
                  />

                  <Input
                    label="Last Name"
                    value={formData.insured?.lastName || ''}
                    onChange={(e) => updateFormData('insured', 'lastName', e.target.value)}
                    error={errors.insuredLastName}
                    placeholder="Enter last name"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="Date of Birth"
                    type="date"
                    value={formData.insured?.dateOfBirth || ''}
                    onChange={(e) => updateFormData('insured', 'dateOfBirth', e.target.value)}
                    error={errors.insuredDateOfBirth}
                  />

                  <Select
                    label="Relationship to Owner"
                    options={relationshipOptions}
                    value={formData.insured?.relationshipToOwner || ''}
                    onChange={(e) => updateFormData('insured', 'relationshipToOwner', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Agent Information */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Agent Information</h2>
                  <p className="text-slate-600">Enter the agent's contact information.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="First Name"
                    value={formData.agent?.firstName || ''}
                    onChange={(e) => updateFormData('agent', 'firstName', e.target.value)}
                    error={errors.agentFirstName}
                    placeholder="Enter first name"
                  />

                  <Input
                    label="Last Name"
                    value={formData.agent?.lastName || ''}
                    onChange={(e) => updateFormData('agent', 'lastName', e.target.value)}
                    error={errors.agentLastName}
                    placeholder="Enter last name"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="Email"
                    type="email"
                    value={formData.agent?.email || ''}
                    onChange={(e) => updateFormData('agent', 'email', e.target.value)}
                    error={errors.agentEmail}
                    placeholder="Enter email address"
                  />

                  <Input
                    label="Phone"
                    type="tel"
                    value={formData.agent?.phone || ''}
                    onChange={(e) => updateFormData('agent', 'phone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="License Number (Optional)"
                    value={formData.agent?.licenseNumber || ''}
                    onChange={(e) => updateFormData('agent', 'licenseNumber', e.target.value)}
                    placeholder="Enter license number"
                  />

                  <Input
                    label="Agency Name (Optional)"
                    value={formData.agent?.agencyName || ''}
                    onChange={(e) => updateFormData('agent', 'agencyName', e.target.value)}
                    placeholder="Enter agency name"
                  />
                </div>
              </div>
            )}

            {/* Step 5: Source Policies */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Source Policies</h2>
                    <p className="text-slate-600">Add the policies to be exchanged.</p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={addSourceAccount}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Policy
                  </Button>
                </div>

                <div className="space-y-6">
                  {formData.sourceAccounts?.map((account, index) => (
                    <Card key={index} className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-900">Policy {index + 1}</h3>
                        {formData.sourceAccounts!.length > 1 && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeSourceAccount(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          label="Policy/Account Number"
                          value={account.accountNumber}
                          onChange={(e) => updateSourceAccount(index, 'accountNumber', e.target.value)}
                          error={errors[`account${index}Number`]}
                          placeholder="Enter policy number"
                        />

                        <Select
                          label="Current Carrier"
                          options={carrierOptions}
                          value={account.carrierId}
                          onChange={(e) => updateSourceAccount(index, 'carrierId', e.target.value)}
                          error={errors[`account${index}Carrier`]}
                          placeholder="Select carrier"
                        />

                        <Select
                          label="Product Type"
                          options={productTypeOptions}
                          value={account.accountType}
                          onChange={(e) => updateSourceAccount(index, 'accountType', e.target.value)}
                        />

                        <Input
                          label="Product Name (Optional)"
                          value={account.productName || ''}
                          onChange={(e) => updateSourceAccount(index, 'productName', e.target.value)}
                          placeholder="Enter product name"
                        />

                        <Input
                          label="Current Value"
                          type="number"
                          value={account.currentValue || ''}
                          onChange={(e) => updateSourceAccount(index, 'currentValue', parseFloat(e.target.value) || 0)}
                          placeholder="Enter current value"
                        />

                        <Input
                          label="Surrender Value"
                          type="number"
                          value={account.surrenderValue || ''}
                          onChange={(e) => updateSourceAccount(index, 'surrenderValue', parseFloat(e.target.value) || 0)}
                          placeholder="Enter surrender value"
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Step 6: Success */}
            {currentStep === 6 && (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Exchange Created Successfully!</h2>
                  <p className="text-slate-600">Your 1035 exchange has been submitted and is now being processed.</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <p className="text-emerald-800">
                    You will be redirected to the exchange details page shortly...
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            {currentStep < 6 && (
              <div className="flex justify-between pt-8 border-t border-slate-200">
                <Button 
                  variant="secondary" 
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>

                {currentStep < 5 ? (
                  <Button variant="primary" onClick={handleNext}>
                    Next
                  </Button>
                ) : (
                  <Button 
                    variant="primary" 
                    onClick={handleSubmit}
                    loading={loading}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Exchange
                  </Button>
                )}
              </div>
            )}

            {errors.submit && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{errors.submit}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};