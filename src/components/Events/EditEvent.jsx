import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { fetchEvent, updateEvent } from "../../utils/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();

  const {
    isPending: eventIsPending,
    isError: eventIsError,
    error: eventError,
    data: eventData,
  } = useQuery({
    queryKey: ["events", { id }],
    queryFn: fetchEvent,
  });

  const {
    mutate,
    status: _updateStatus,
    error: _updateError,
  } = useMutation({
    mutationFn: updateEvent,
    onMutate: async (updatedData) => {
      const updatedEvent = updatedData.event;
      await queryClient.cancelQueries({ queryKey: ["events"] });
      const previousEvent = queryClient.getQueryData(["events", { id }]);
      queryClient.setQueryData(["events", { id }], updatedEvent);
      return { previousEvent };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(["events", { id }], context.previousEvent);
    },
    // onSuccess: () => {
    //   navigate("../");
    // },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["events", { id }] });
    },
  });

  function handleSubmit(formData) {
    mutate({ id, event: formData });
    navigate("../");
  }

  function handleClose() {
    navigate("../");
  }

  return (
    <Modal onClose={handleClose}>
      {eventIsPending ? (
        <LoadingIndicator />
      ) : eventIsError ? (
        <>
          <ErrorBlock
            title="Failed to fetch event"
            message={
              eventError.info?.message ||
              "An error occured while fetching event. Please check your inputs and try again later."
            }
          />
          <div className="form-actions">
            <Link to="../" className="button">
              Okay
            </Link>
          </div>
        </>
      ) : (
        <EventForm inputData={eventData} onSubmit={handleSubmit}>
          <Link to="../" className="button-text">
            Cancel
          </Link>
          <button type="submit" className="button">
            Update
          </button>
        </EventForm>
      )}
    </Modal>
  );
}
