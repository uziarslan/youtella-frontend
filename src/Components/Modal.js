import React, { useEffect, useRef } from "react";
import { Modal as BootstrapModal } from "bootstrap";

export default function Modal({ id, show, onClose, children }) {
    const modalRef = useRef(null);
    const modalInstance = useRef(null);
    const onCloseRef = useRef(onClose);

    // Keep closure updated
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!modalRef.current) return;

        const modalElement = modalRef.current;

        // Initialize only once
        if (!modalInstance.current) {
            modalInstance.current = new BootstrapModal(modalElement, {
                backdrop: 'static'
            });

            // Handle hidden event
            const handleHidden = () => {
                onCloseRef.current();
            };

            modalElement.addEventListener('hidden.bs.modal', handleHidden);
        }

        return () => {
            if (modalInstance.current) {
                // Cleanup when component unmounts
                modalInstance.current.dispose();
                modalInstance.current = null;
            }
        };
    }, []);

    // Handle show/hide transitions
    useEffect(() => {
        if (!modalInstance.current) return;

        if (show) {
            modalInstance.current.show();
        } else {
            modalInstance.current.hide();
        }
    }, [show]);

    return (
        <div
            ref={modalRef}
            className="modal fade"
            id={id}
            tabIndex="-1"
            aria-labelledby={`${id}Label`}
            aria-hidden="true"
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-body">
                        <div className="modalBodyWrapper">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}