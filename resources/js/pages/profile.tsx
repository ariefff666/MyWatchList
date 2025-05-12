import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { PageProps as BasePageProps, User } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import DeleteUserForm from './profile/DeleteUserForm';
import UpdatePasswordForm from './profile/UpdatePasswordForm';
import UpdateProfileInformation from './profile/UpdateProfileInformationForm';

interface ProfileEditPageProps extends BasePageProps {
    mustVerifyEmail: boolean;
    status?: string;
}

export default function Edit() {
    const { props } = usePage<ProfileEditPageProps>();
    const user = props.auth.user as User; // Cast ke tipe User kita

    return (
        <AuthenticatedLayout user={user} header={<h2 className="text-xl leading-tight font-semibold text-gray-200">Pengaturan Akun Profil</h2>}>
            <Head title="Pengaturan Profil" />

            <div className="py-8 md:py-12">
                <div className="mx-auto max-w-3xl space-y-6 sm:px-6 lg:px-8">
                    {/* Ganti bg-white menjadi bg-gray-800 dan sesuaikan warna teks */}
                    <div className="bg-gray-800 p-4 shadow-xl sm:rounded-lg sm:p-8">
                        <UpdateProfileInformation mustVerifyEmail={props.mustVerifyEmail} status={props.status} className="max-w-xl" />
                    </div>

                    <div className="bg-gray-800 p-4 shadow-xl sm:rounded-lg sm:p-8">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="bg-gray-800 p-4 shadow-xl sm:rounded-lg sm:p-8">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
