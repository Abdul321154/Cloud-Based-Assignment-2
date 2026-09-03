const SIGNATURE_ITEMS = [
  { label: "Student Name", value: "Abdullah Adnan Yakoob Al-Mashhadani" },
  { label: "Student Number", value: "21991414" },
];

export function BottomSignature() {
  return (
    <footer className="bg-slate-100 dark:bg-slate-900 p-6 text-center">
      {SIGNATURE_ITEMS.map((item) => (
        <p
          key={item.label}
          className="mt-2 text-lg leading-8 text-slate-600 dark:text-slate-300"
        >
          <strong>{item.label}:</strong> {item.value}
        </p>
      ))}
    </footer>
  );
}

export default BottomSignature;
