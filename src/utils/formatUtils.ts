// Currency formatting
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatCurrencyDetailed = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Number formatting
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

// String formatting
export const formatName = (firstName: string, lastName: string, middleName?: string): string => {
  if (middleName) {
    return `${firstName} ${middleName} ${lastName}`;
  }
  return `${firstName} ${lastName}`;
};

export const formatInitials = (firstName: string, lastName: string, middleName?: string): string => {
  const first = firstName.charAt(0).toUpperCase();
  const last = lastName.charAt(0).toUpperCase();
  const middle = middleName ? middleName.charAt(0).toUpperCase() : '';
  
  return middle ? `${first}${middle}${last}` : `${first}${last}`;
};

// Phone formatting
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone; // Return original if can't format
};

// SSN formatting (for display - partial masking)
export const formatSSNMasked = (ssn: string): string => {
  const cleaned = ssn.replace(/\D/g, '');
  if (cleaned.length === 9) {
    return `***-**-${cleaned.slice(-4)}`;
  }
  return '***-**-****';
};

// Address formatting
export const formatAddress = (
  line1: string,
  line2?: string,
  city?: string,
  state?: string,
  zipCode?: string,
  country?: string
): string => {
  const parts = [line1];
  
  if (line2) parts.push(line2);
  
  const cityStateZip = [city, state, zipCode].filter(Boolean).join(' ');
  if (cityStateZip) parts.push(cityStateZip);
  
  if (country && country !== 'USA') parts.push(country);
  
  return parts.join(', ');
};

// File size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Status formatting
export const formatStatus = (status: string): string => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Truncate text
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};

// Capitalize first letter
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Convert camelCase to Title Case
export const camelToTitle = (str: string): string => {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, char => char.toUpperCase())
    .trim();
};

// Generate display ID (shorter version of full ID)
export const formatDisplayId = (id: string): string => {
  return id.slice(-8).toUpperCase();
};

// Format ticket number for display
export const formatTicketNumber = (ticketNumber: string): string => {
  return ticketNumber.toUpperCase();
};