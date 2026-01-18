export function generateSalesUid(branchCode: string = '001', sequence: number = 1): string {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');

    // In a real app, 'sequence' comes from the backend to ensure uniqueness.
    // Here we pad it to 3 digits.
    const seq = String(sequence).padStart(3, '0');

    return `${branchCode}.${yy}${mm}${dd}.${seq}`;
}
