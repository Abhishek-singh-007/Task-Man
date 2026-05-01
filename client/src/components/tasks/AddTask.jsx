import { Dialog } from "@headlessui/react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { BiImages } from "react-icons/bi";
import { toast } from "sonner";

import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
} from "../../redux/slices/api/taskApiSlice";
import { dateFormatter } from "../../utils";
import { app } from "../../utils/firebase";
import Button from "../Button";
import Loading from "../Loading";
import ModalWrapper from "../ModalWrapper";
import SelectList from "../SelectList";
import Textbox from "../Textbox";
import UserList from "./UsersSelect";

const LISTS = ["TODO", "IN PROGRESS", "COMPLETED"];
const PRIORIRY = ["HIGH", "MEDIUM", "NORMAL", "LOW"];

let uploadedFileURLs = [];

const uploadFile = async (file) => {
  const storage = getStorage(app);

  const name = new Date().getTime() + file.name;
  const storageRef = ref(storage, name);

  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      () => {},
      (error) => reject(error),
      () => {
        getDownloadURL(uploadTask.snapshot.ref)
          .then((downloadURL) => {
            uploadedFileURLs.push(downloadURL);
            resolve();
          })
          .catch((error) => reject(error));
      },
    );
  });
};

const AddTask = ({ open, setOpen, task, stage: selectedStage }) => {
  const defaultValues = {
    title: task?.title || "",
    date: dateFormatter(task?.date || new Date()),
    team: [],
    description: "",
    links: "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  // 🔥 FIX: external stage use
  const [stage, setStage] = useState(
    task?.stage?.toUpperCase() || selectedStage?.toUpperCase() || "TODO",
  );

  const [team, setTeam] = useState(task?.team || []);
  const [priority, setPriority] = useState(
    task?.priority?.toUpperCase() || PRIORIRY[2],
  );
  const [assets, setAssets] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [createTask, { isLoading }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();

  const URLS = task?.assets ? [...task.assets] : [];

  // 🔥 VERY IMPORTANT: jab stage change ho (click se), update karo
  useEffect(() => {
    if (selectedStage) {
      setStage(selectedStage.toUpperCase());
    }
  }, [selectedStage]);

  const handleOnSubmit = async (data) => {
    uploadedFileURLs = []; // reset

    for (const file of assets) {
      setUploading(true);
      try {
        await uploadFile(file);
      } catch (error) {
        console.error(error);
        return;
      } finally {
        setUploading(false);
      }
    }

    try {
      const newData = {
        ...data,
        assets: [...URLS, ...uploadedFileURLs],
        team,
        stage: stage.toLowerCase(), // 🔥 IMPORTANT FIX
        priority,
      };

      const res = task?._id
        ? await updateTask({ ...newData, _id: task._id }).unwrap()
        : await createTask(newData).unwrap();

      toast.success(res.message);

      setOpen(false);
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleSelect = (e) => {
    setAssets(e.target.files);
  };

  return (
    <ModalWrapper open={open} setOpen={setOpen}>
      <form onSubmit={handleSubmit(handleOnSubmit)}>
        <Dialog.Title className="text-base font-bold mb-4">
          {task ? "UPDATE TASK" : "ADD TASK"}
        </Dialog.Title>

        <div className="flex flex-col gap-6">
          <Textbox
            placeholder="Task title"
            type="text"
            label="Task Title"
            register={register("title", {
              required: "Title is required!",
            })}
            error={errors.title?.message}
          />

          <UserList setTeam={setTeam} team={team} />

          <div className="flex gap-4">
            <SelectList
              label="Task Stage"
              lists={LISTS}
              selected={stage}
              setSelected={setStage}
            />

            <SelectList
              label="Priority Level"
              lists={PRIORIRY}
              selected={priority}
              setSelected={setPriority}
            />
          </div>

          <Textbox
            type="date"
            label="Task Date"
            register={register("date", {
              required: "Date is required!",
            })}
            error={errors.date?.message}
          />

          <div>
            <label className="cursor-pointer flex gap-2 items-center">
              <BiImages />
              <input
                type="file"
                className="hidden"
                onChange={handleSelect}
                multiple
              />
              Add Assets
            </label>
          </div>

          <textarea
            placeholder="Description"
            {...register("description")}
            className="border p-2 rounded"
          />
        </div>

        {isLoading || isUpdating || uploading ? (
          <Loading />
        ) : (
          <div className="flex justify-end gap-4 mt-4">
            <Button label="Submit" type="submit" />
            <Button label="Cancel" onClick={() => setOpen(false)} />
          </div>
        )}
      </form>
    </ModalWrapper>
  );
};

export default AddTask;
