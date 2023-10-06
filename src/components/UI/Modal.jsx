import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function Modal({ children, onClose }) {
  const dialogRef = useRef();

  useEffect(() => {
    // Using useEffect to sync the Modal component with the DOM Dialog API
    // This code will open the native <dialog> via it's built-in API
    // whenever the <Modal> component is rendered
    const modal = dialogRef.current;
    modal.showModal();

    return () => {
      // Unless you previously cached dialogRef.current within
      // useEffect callback function context an error will be thrown
      // for dialogRef.current being null
      modal.close(); // needed to avoid error being thrown
    };
  }, []);

  return createPortal(
    <dialog className="modal" ref={dialogRef} onClose={onClose}>
      {children}
    </dialog>,
    document.getElementById("modal")
  );
}
