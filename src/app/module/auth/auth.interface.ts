export interface ILoginUserPayload {
    email: string;
    password: string;
}

export interface IRegisterPatientPayload {
    name: string;
    email: string;
    password: string;
}

export interface IChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}


//for super admin 
export interface ICreateSuperAdminPayload {
    name: string;
    email: string;
    password: string;
    profilePhoto?: string;
    contactNumber?: string;
}