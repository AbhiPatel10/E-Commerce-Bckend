export interface UploadResult {
    url: string;
    providerKey: string;
}

export interface IStorageProvider {
    upload(file: Express.Multer.File): Promise<UploadResult>;
    delete(providerKey: string): Promise<void>;
}
