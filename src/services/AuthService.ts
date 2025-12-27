import { IAuthRepository } from '@/repositories/interfaces/IAuthRepository';

type RegisterInput = {
    email: string;
    password: string;
    fullName: string;
    orgId: string;
};

export class AuthService {
    constructor(private repo: IAuthRepository) { }

    async login(email: string, password: string, orgId: string) {
        // 1. Intentem Auth
        const { user, error } = await this.repo.signIn(email, password);
        if (error || !user) {
            throw new Error("Credencials invàlides");
        }

        // 2. Verifiquem si té "Visat" (Perfil en aquesta org)
        const profile = await this.repo.getProfile(user.id, orgId);

        if (!profile) {
            // No és client d'aquesta web. Fora.
            await this.repo.signOut();
            throw new Error("NO_PROFILE"); // Error conegut per nosaltres
        }

        return user;
    }
    // 👇 AFEGEIX AQUEST MÈTODE PÚBLIC
    async getProfile(userId: string, orgId: string) {
        return this.repo.getProfile(userId, orgId);
    }
    async register(input: RegisterInput) {
        const { email, password, fullName, orgId } = input;

        // 1. Intentem Registre
        const { user: newUser, error } = await this.repo.signUp(email, password, {
            full_name: fullName,
            org_id: orgId
        });

        // 2. Gestió d'Errors (Lògica Multi-Tenant)
        if (error) {
            // Cas: Usuari ja existeix a la plataforma
            if (error.message.includes("already registered") || error.status === 422) {

                // Intentem login automàtic per verificar propietat
                const { user: existingUser, error: loginError } = await this.repo.signIn(email, password);

                if (loginError || !existingUser) {
                    throw new Error("ACCOUNT_EXISTS_WRONG_PASS");
                }

                // ÉXIT: L'usuari és propietari. Li creem el perfil aquí.
                await this.ensureProfileExists(existingUser.id, email, fullName, orgId);
                return existingUser;
            }

            throw new Error("GENERIC_ERROR");
        }

        // 3. Cas Feliç (Usuari nou) -> Assegurar perfil
        if (newUser) {
            // Donem un marge al trigger, o ho fem manualment per seguretat
            await this.ensureProfileExists(newUser.id, email, fullName, orgId);
            return newUser;
        }
    }

    async logout() {
        return this.repo.signOut();
    }

    // Helper privat per garantir que el perfil es crea
    private async ensureProfileExists(userId: string, email: string, name: string, orgId: string) {
        const profile = await this.repo.getProfile(userId, orgId);
        if (!profile) {
            console.log(`Creating profile manually for user ${userId} in org ${orgId}`);
            await this.repo.createProfileForce({
                id: userId,
                email,
                full_name: name,
                organization_id: orgId
            });
        }
    }

    // 👇 NOU MÈTODE: Obtenir rol actual
    async getUserRole(userId: string, orgId: string): Promise<'admin' | 'client' | 'lead' | 'staff'> {
        const profile = await this.repo.getProfile(userId, orgId);
        return profile?.role || 'lead'; // Per defecte 'lead' per seguretat
    }

    // 👇 NOU MÈTODE: Verificar si és admin (Boolean)
    async isAdmin(userId: string, orgId: string): Promise<boolean> {
        const role = await this.getUserRole(userId, orgId);
        return role === 'admin';
    }

    // 👇 NOU: Helper per decidir on redirigir segons el rol
    async getRedirectPath(userId: string, orgId: string): Promise<string> {
        const role = await this.getUserRole(userId, orgId);

        switch (role) {
            case 'admin':
            case 'staff': // Els treballadors també van al dashboard
                return '/dashboard';
            case 'client':
            default:
                return '/my-account'; // Els clients van a la seva àrea privada
        }
    }
}