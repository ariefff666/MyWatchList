import { forwardRef, InputHTMLAttributes, useEffect, useImperativeHandle, useRef } from 'react';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
    isFocused?: boolean;
    // Tambahkan prop lain jika perlu, misal 'withIcon', dll.
}

export default forwardRef(function TextInput({ type = 'text', className = '', isFocused = false, ...props }: TextInputProps, ref) {
    const localRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                `rounded-md border-gray-600 bg-gray-700 text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-600 disabled:opacity-50 ` +
                className
            }
            ref={localRef}
        />
    );
});
