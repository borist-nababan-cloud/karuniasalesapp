import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData, parseAuthError } from '@karunia/shared';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { ENV } from '@/config/env';
import boxLogo from '@/assets/box-logo.jpg';


export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        setError(null);
        try {
            // Login with Supabase
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: data.identifier.trim(),
                password: data.password.trim(),
            });
            
            if (authError) throw authError;

            const user = authData.user;
            const session = authData.session;

            if (!user || !session) throw new Error("Login failed to return session");

            // Check User Profile Status
            const { data: profile, error: profileError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError || !profile) {
                // Fallback
                login({
                    id: user.id,
                    email: user.email!,
                    username: user.email!
                }, session.access_token, false);
                await supabase.auth.signOut();
                alert("Profil tidak lengkap. Silakan hubungi admin.");
                return;
            }

            if (profile.blocked) {
                alert("Akses Ditolak: Anda telah diblokir oleh admin.");
                return;
            }

            if (profile.confirmed !== true) {
                await supabase.auth.signOut();
                alert("Pendaftaran tertunda: Silakan tunggu administrator untuk menyetujui akun Anda.");
                return;
            }

            login({
                id: user.id,
                email: user.email!,
                username: profile.username || user.email!,
                role_id: profile.role_id
            }, session.access_token, true);

            if (profile.force_password_reset) {
                navigate('/reset-password-mandatory');
            } else {
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(parseAuthError(err));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full space-y-8">
            <Card className="w-full shadow-lg border-t-4 border-t-primary">
                <CardHeader className="flex flex-col items-center space-y-2">
                    <img src={boxLogo} alt="Logo" className="h-16 w-auto mb-2" />
                    <CardTitle className="text-2xl font-bold text-primary">Sales App</CardTitle>
                    <CardDescription>Welcome back! Please login to continue.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="identifier">Email</Label>
                            <Input id="identifier" type="email" placeholder="sales@dealer.com" {...register('identifier')} />
                            {errors.identifier && <p className="text-sm text-red-500">{errors.identifier.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input id="password" type={showPassword ? 'text' : 'password'} {...register('password')} className="pr-10" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-2">
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                            {isLoading ? 'Logging in...' : 'Login'}
                        </Button>
                        <div className="text-sm text-center text-gray-500">
                            Don't have an account? <Link to="/auth/register" className="text-primary hover:underline font-semibold">Register</Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>

            <div className="text-center space-y-1">
                <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-bold text-sm">
                    Karunia Apps @nababancloud.net 2025
                </p>
                <p className="text-xs text-gray-400 font-mono tracking-wider">
                    Trial Version {ENV.APP_VERSION}
                </p>
            </div>
        </div>

    );
}
