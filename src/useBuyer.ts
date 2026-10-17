import { useAuth, DEMO_BUYER } from './useAuth';

export { DEMO_BUYER };

export function useBuyerSession() {
  const {
    buyer,
    loginBuyer,
    loginBuyerByNameEmail,
    quickLoginDemoBuyer,
    signOut,
    toggleSaveArtwork,
    isArtworkSaved,
  } = useAuth();

  return {
    buyer,
    signIn: loginBuyer,
    signOut,
    loginOrRegister: (name: string, email: string) => loginBuyerByNameEmail(name, email),
    quickLoginDemoBuyer,
    toggleSaveArtwork,
    isArtworkSaved,
  };
}
