import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/axios';
import { ENV } from '@/config/env';
import boxLogo from '@/assets/box-logo.jpg';

const loginSchema = z.object({
    identifier: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        setError(null);
        try {
            // Mock login for now if API fails, or use real API
            const response = await api.post('/auth/local', {
                identifier: data.identifier,
                password: data.password,
            });

            const { user, jwt } = response.data;

            // Check Sales Profile Status
            try {
                const profileRes = await api.get('/sales-profiles', {
                    params: {
                        filters: { email: { $eq: user.email } }
                    },
                    headers: {
                        Authorization: `Bearer ${jwt}`,
                    },
                });

                if (profileRes.data?.data?.length > 0) {
                    const profileData = profileRes.data.data[0];
                    const profile = profileData.attributes ? { ...profileData.attributes, id: profileData.id } : profileData;

                    if (profile.blocked) {
                        alert("Access Denied: You are blocked by admin.");
                        return;
                    }

                    // Handle potential string vs boolean mismatch
                    const isApproved = profile.approved === true || profile.approved === 'true';


                    login(user, jwt, isApproved);

                    if (isApproved) {
                        navigate('/dashboard');
                    } else {
                        navigate('/profile');
                    }
                } else {
                    // No profile found (legacy user?), default to unapproved/profile
                    login(user, jwt, false);
                    navigate('/profile');
                }
            } catch (profileErr) {
                console.error("Profile check failed", profileErr);
                // Fallback
                login(user, jwt, false);
                navigate('/profile');
            }
        } catch (err: any) {
            console.error(err);

            setError(err.response?.data?.error?.message || 'Invalid credentials');
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
                            <Input id="password" type="password" {...register('password')} />
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
