import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main 
      className="min-h-screen relative flex flex-col justify-center p-4 sm:p-8 md:pl-20 lg:pl-32 xl:pl-48 bg-cover bg-center bg-no-repeat overflow-hidden" 
      style={{ backgroundImage: "url('/bg-login.png')" }}
    >
      {/* Optional dark overlay to ensure text contrast if bg is too bright */}
      <div className="absolute inset-0 bg-black/10 z-0"></div>
      
      <div className="relative z-10 w-full max-w-md">
        <LoginForm />
      </div>
    </main>
  );
}
