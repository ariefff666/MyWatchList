import Modal from '@/components/common/Modal';
import { showToast } from '@/components/common/ToastNotification'; // Impor helper toast
import { Playlist } from '@/types';
import { router, useForm } from '@inertiajs/react'; // Impor router
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import InputError from '../common/InputError';
import InputLabel from '../common/InputLabel';
import PrimaryButton from '../common/PrimaryButton';
import SecondaryButton from '../common/SecondaryButton';
import TextInput from '../common/TextInput';

interface CreatePlaylistModalProps {
    isOpen: boolean;
    onClose: () => void;
    // onPlaylistCreated tidak lagi diperlukan jika navigasi langsung dari sini
}

const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({ isOpen, onClose }) => {
    const { data, setData, errors, setError, clearErrors, reset } = useForm({
        name: '',
        description: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            reset(); // Reset form fields and errors
            clearErrors();
        }
    }, [isOpen, reset, clearErrors]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors('name', 'description'); // Bersihkan error spesifik field sebelumnya
        setIsSubmitting(true);

        try {
            const response = await axios.post(route('api.playlists.store'), data);
            const newPlaylist = response.data.playlist as Playlist | undefined;

            reset();
            onClose();

            window.dispatchEvent(new CustomEvent('refreshSidebarPlaylists'));

            if (newPlaylist && newPlaylist.id) {
                router.visit(route('playlist.show', { playlist: newPlaylist.id }));
                if (newPlaylist && newPlaylist.name) {
                    showToast(`Playlist "${newPlaylist.name}" berhasil dibuat!`, 'success');
                } else {
                    showToast(`Playlist berhasil dibuat!`, 'success');
                    console.warn('Data playlist baru tidak lengkap dari respons backend:', response.data);
                }
            } else {
                router.visit(route('dashboard'));
            }
        } catch (error: any) {
            if (error.response && error.response.status === 422) {
                const validationErrors = error.response.data.errors;
                // Set error spesifik field menggunakan setError dari useForm
                if (validationErrors.name) {
                    setError('name', validationErrors.name[0]);
                }
                if (validationErrors.description) {
                    setError('description', validationErrors.description[0]);
                }
                // Tidak perlu toast generik di sini karena InputError akan tampil
            } else {
                // Untuk error server lain atau network error
                showToast(error.response?.data?.message || 'Gagal membuat playlist karena kesalahan server.', 'error');
                console.error('Error creating playlist:', error);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseModal = () => {
        reset();
        clearErrors();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleCloseModal} title="Buat Playlist Baru" maxWidth="lg">
            <form onSubmit={handleSubmit} className="space-y-6 rounded-b-lg bg-gray-800 p-6">
                <div>
                    <InputLabel htmlFor="name_create_v4" value="Nama Playlist" className="text-gray-200" />
                    <TextInput
                        id="name_create_v4"
                        name="name"
                        value={data.name}
                        className={`mt-1 block w-full border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500 ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        autoComplete="off"
                        isFocused={isOpen}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    {/* InputError akan otomatis menampilkan pesan dari state errors.name */}
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="description_create_v4" value="Deskripsi (Opsional)" className="text-gray-200" />
                    <textarea
                        id="description_create_v4"
                        name="description"
                        value={data.description}
                        className={`mt-1 block h-24 w-full resize-none rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        onChange={(e) => setData('description', e.target.value)}
                    />
                    <InputError message={errors.description} className="mt-2" />
                </div>

                <div className="flex items-center justify-end space-x-4 border-t border-gray-700 pt-4">
                    <SecondaryButton onClick={handleCloseModal} type="button" className="text-gray-300 hover:bg-gray-700" disabled={isSubmitting}>
                        Batal
                    </SecondaryButton>
                    <PrimaryButton className="bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-800" disabled={isSubmitting}>
                        {isSubmitting ? 'Membuat...' : 'Buat Playlist'}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
};

export default CreatePlaylistModal;
