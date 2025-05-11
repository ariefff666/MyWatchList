import { Playlist } from '@/types';
import { useForm } from '@inertiajs/react';
import React from 'react';
import InputLabel from '../common/InputLabel';
import Modal from '../common/Modal';
import PrimaryButton from '../common/PrimaryButton';
import SecondaryButton from '../common/SecondaryButton';
import TextInput from '../common/TextInput';
import InputError from '../input-error';

interface CreatePlaylistModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPlaylistCreated: (newPlaylist: Playlist) => void; // Callback setelah berhasil
}

const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({ isOpen, onClose, onPlaylistCreated }) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('api.playlists.store'), {
            // Panggil API backend
            onSuccess: (page: any) => {
                // page.props.flash mungkin berisi data playlist baru
                const newPlaylistData = page.props.flash?.playlist || (page.props as any).playlist; // Sesuaikan dengan respons backend Anda
                if (newPlaylistData) {
                    onPlaylistCreated(newPlaylistData as Playlist);
                } else {
                    // Jika backend tidak mengirim playlist baru di flash, panggil onPlaylistCreated
                    // dengan data minimal atau trigger refresh di parent.
                    // Untuk sekarang, kita asumsikan backend mengirimnya.
                    console.warn('Playlist baru dibuat, tapi data tidak diterima di flash.props.playlist');
                }
                reset();
                // onClose(); // onClose akan dihandle oleh DashboardPage untuk menghapus query param
            },
            onError: (errs) => {
                console.error('Error creating playlist:', errs);
                // Errors akan otomatis ditampilkan oleh InputError
            },
            onFinish: () => {
                // Tidak perlu reset di sini jika onSuccess sudah reset
            },
        });
    };

    const handleClose = () => {
        reset(); // Reset form saat modal ditutup
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Buat Playlist Baru" maxWidth="lg">
            <form onSubmit={handleSubmit} className="space-y-6 rounded-b-lg bg-gray-800 p-6">
                <div>
                    <InputLabel htmlFor="name" value="Nama Playlist" className="text-gray-200" />
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500"
                        autoComplete="off"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="description" value="Deskripsi (Opsional)" className="text-gray-200" />
                    <textarea
                        id="description"
                        name="description"
                        value={data.description}
                        className="mt-1 block h-24 w-full resize-none rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        onChange={(e) => setData('description', e.target.value)}
                    />
                    <InputError message={errors.description} className="mt-2" />
                </div>

                <div className="flex items-center justify-end space-x-4 border-t border-gray-700 pt-4">
                    <SecondaryButton onClick={handleClose} type="button" className="text-gray-300 hover:bg-gray-700">
                        Batal
                    </SecondaryButton>
                    <PrimaryButton className="bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-800" disabled={processing}>
                        {processing ? 'Membuat...' : 'Buat Playlist'}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
};

export default CreatePlaylistModal;
