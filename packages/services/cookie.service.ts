export function getCookieByName(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length !== 2) {
    return undefined;
  }
  return parts.pop().split(';').shift();
}

export function setCookieForAllSubdomains(
  baseDomain: string,
  cookieName: string,
  cookieValue: string
) {
  document.cookie = `${cookieName}=${cookieValue};domain=.${baseDomain};path=/`;
}
