import type { HookContext } from '../declarations'

export const addPdfHeaders = async (context: HookContext) => {
  // Ensure context.http exists if not already present
  if (!context.http) {
    context.http = {};
  }
  // Ensure context.http.headers exists
  if (!context.http.headers) {
    context.http.headers = {};
  }
  // Set a custom header
  context.http.headers['Content-Type'] = 'application/pdf';
  context.http.headers['Content-Disposition'] = 'attachment; filename="rates-report.pdf"';
  return context;
}
