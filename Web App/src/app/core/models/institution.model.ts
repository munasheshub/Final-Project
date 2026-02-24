export interface CreateAddressRequest {
  street: string;
  city: string;
  province: string;
  country: string;
  postalCode?: string;
}

export interface InstitutionDto {
  id?: number;
  name: string;
  code: string;
  subdomain?: string;
  email: string;
  phoneNumber?: string;
  address?: CreateAddressRequest;
  website?: string;
  logoUrl?: string;
  description?: string;
  isActive?: boolean;
  isBlockchainAuthorized?: boolean;
  blockchainAddress?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateInstitutionRequest {
  id?: number;
  tenantId?: string;
  name: string;
  code: string;
  logoUrl?: string;
  email: string;
  phoneNumber: string;
  subdomain: string;
  address?: CreateAddressRequest;
  website?: string;
  description?: string;
}

export interface UpdateInstitutionRequest {
  id: number;
  tenantId?: string;
  name: string;
  code: string;
  logoUrl?: string;
  email: string;
  phoneNumber: string;
  subdomain: string;
  address?: CreateAddressRequest;
  website?: string;
  description?: string;
  isBlockchainAuthorized?: boolean;
  blockchainAddress?: string;
}
