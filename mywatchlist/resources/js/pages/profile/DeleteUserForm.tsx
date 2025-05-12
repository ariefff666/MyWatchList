import DangerButton from '@/components/common/DangerButton';
import InputError from '@/components/common/InputError';
import InputLabel from '@/components/common/InputLabel';
import Modal from '@/components/common/Modal';
import SecondaryButton from '@/components/common/SecondaryButton';
import TextInput from '@/components/common/TextInput';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }: { className?: string }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();
        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-gray-100">Hapus Akun</h2>
                <p className="mt-1 text-sm text-gray-400">
                    Setelah akun Anda dihapus, semua sumber daya dan datanya akan dihapus secara permanen. Sebelum menghapus akun Anda, harap unduh
                    data atau informasi apa pun yang ingin Anda simpan.
                </p>
            </header>

            <DangerButton onClick={confirmUserDeletion} className="bg-red-600 hover:bg-red-700">
                Hapus Akun
            </DangerButton>

            <Modal isOpen={confirmingUserDeletion} onClose={closeModal} title="Konfirmasi Hapus Akun" maxWidth="lg">
                <form onSubmit={deleteUser} className="rounded-b-lg bg-gray-800 p-6">
                    {' '}
                    {/* Pastikan modal content punya bg */}
                    <h2 className="text-lg font-medium text-gray-100">Apakah Anda yakin ingin menghapus akun Anda?</h2>
                    <p className="mt-1 text-sm text-gray-400">
                        Setelah akun Anda dihapus, semua sumber daya dan datanya akan dihapus secara permanen. Harap masukkan kata sandi Anda untuk
                        mengonfirmasi bahwa Anda ingin menghapus akun Anda secara permanen.
                    </p>
                    <div className="mt-6">
                        <InputLabel htmlFor="password_delete" value="Kata Sandi" className="sr-only text-gray-300" />
                        <TextInput
                            id="password_delete"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="mt-1 block w-3/4 border-gray-600 bg-gray-700 text-gray-200 focus:border-red-500 focus:ring-red-500"
                            isFocused
                            placeholder="Kata Sandi"
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <SecondaryButton onClick={closeModal} type="button" className="text-gray-300 hover:bg-gray-700">
                            Batal
                        </SecondaryButton>
                        <DangerButton className="ms-3 bg-red-600 hover:bg-red-700" disabled={processing}>
                            Hapus Akun Saya
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
