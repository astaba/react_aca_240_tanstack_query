import { useState } from "react";
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import Header from "../Header.jsx";
import { deleteEvent, fetchEvent } from "../../utils/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import Modal from "../UI/Modal.jsx";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteBox, setDeleteBox] = useState(false);

  const { isPending, isError, error, isSuccess, data } = useQuery({
    queryKey: ["events", { id }],
    queryFn: fetchEvent,
  });

  const formatedDate =
    isSuccess &&
    new Date(data.date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const {
    mutate,
    isPending: deletePending,
    isError: deleteIsError,
    error: deleteError,
    reset: resetDeletionStatus,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
      });
      navigate("/events");
    },
  });

  const handleDelete = () => mutate({ id });
  const openDeleteBox = () => setDeleteBox(true);
  const closeDeleteBox = () => {
    if (deleteIsError) resetDeletionStatus();
    setDeleteBox(false);
  };

  return (
    <>
      {deleteBox && (
        <Modal onClose={closeDeleteBox}>
          <h2>Are you sure?</h2>
          <p>
            This action cannot be undone. Are you sure you want to delete this
            item?
          </p>
          <p className="form-actions">
            {!deletePending && (
              <button className="button-text" onClick={closeDeleteBox}>
                Cancel
              </button>
            )}
            <button
              className="button"
              onClick={handleDelete}
              disabled={deletePending}
            >
              {!deletePending ? "Confirm" : "Deleting..."}
            </button>
          </p>
          {deleteIsError && (
            <ErrorBlock
              title="Failed to delete"
              message={
                deleteError.info?.message ||
                "Could not delete item, please try again later"
              }
            />
          )}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      {isPending ? (
        <div id="event-details-content" className="center">
          <p>Loading event...</p>
        </div>
      ) : isError ? (
        <div id="event-details-content" className="center">
          <ErrorBlock
            title="Failed to load event"
            message={
              error.info?.message || "An error occured, please try again later"
            }
          />
        </div>
      ) : (
        <article id="event-details">
          <header>
            <h1>{data.title}</h1>
            <nav>
              <button onClick={openDeleteBox}>Delete</button>
              <Link to="edit">Edit</Link>
            </nav>
          </header>
          <div id="event-details-content">
            <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
            <div id="event-details-info">
              <div>
                <p id="event-details-location">{data.location}</p>
                <time dateTime={`Todo-DateT$Todo-Time`}>
                  {formatedDate} @ {data.time}
                </time>
              </div>
              <p id="event-details-description">{data.description}</p>
            </div>
          </div>
        </article>
      )}
    </>
  );
}
