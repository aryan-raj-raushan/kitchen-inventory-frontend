import 'server-only';
import { AdminCredential, IAdminCredentialDoc } from '../models/AdminCredential';

export async function findByEmail(email: string): Promise<IAdminCredentialDoc | null> {
  return AdminCredential.findOne({ email: email.toLowerCase() });
}
