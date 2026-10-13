// Pages whose links already have an explicit affiliate owner must not load Drive.
export function driveAllowedOnPage(path:string):boolean {
 return !["/deals","/info","/alerts","/trip","/saved"].some(prefix=>path===prefix || path.startsWith(prefix+"/"));
}
