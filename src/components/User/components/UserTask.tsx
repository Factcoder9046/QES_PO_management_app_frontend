import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/redux/store";
import {
  fetchTasksAssignedToUser,
  updateUserTaskStatus,
} from "../../../store/Slice/taskSlice";
import { IoDocumentTextOutline } from "react-icons/io5";
import { SiTicktick } from "react-icons/si";
import { MdAccessTime } from "react-icons/md";

const UserTask = () => {
  const dispatch = useDispatch<AppDispatch>();

  // ✅ Redux state
  const { userTasks, loading, error } = useSelector(
    (state: RootState) => state.task
  );

  const currentUser = useSelector((state: RootState) => state.auth.user);

  // ✅ Fetch tasks on mount
  useEffect(() => {
    if (currentUser?._id) {
      dispatch(fetchTasksAssignedToUser(currentUser._id));
      console.log("Fetching tasks for user:", currentUser._id);
    }
  }, [dispatch, currentUser]);

  // ✅ Debug logs
  useEffect(() => {
    console.log("User tasks updated:", JSON.stringify(userTasks, null, 2));
  }, [userTasks]);

  // ✅ Counters (userStatus se)
  const totalTasks = userTasks.length;
  const pendingTasks = userTasks.filter((t) => t.userStatus !== "completed").length;
  const completedTasks = userTasks.filter((t) => t.userStatus === "completed").length;

  // ✅ Sort: Urgent → Pending → Others
  const sortedTasks = [...userTasks]
    .filter((t) => t.userStatus !== "completed") // ✅ completed hide
    .sort((a, b) => {
      if (a.urgent && !b.urgent) return -1;
      if (!a.urgent && b.urgent) return 1;

      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }

      const timeA = parseInt(a._id.substring(0, 8), 16);
      const timeB = parseInt(b._id.substring(0, 8), 16);
      return timeB - timeA;
    });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col items-start gap-2 px-5">
        <h1 className="text-xl font-semibold text-start">Task Dashboard</h1>
        <span className="text-sm text-start">View and manage assigned tasks</span>
      </div>

      {/* Task Counters */}
      <div className="grid xl:grid-cols-3 lg:grid-cols-3 grid-cols-1 gap-4">
        <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 rounded-lg p-4 border">
          <div className="bg-blue-100 text-blue-500 p-2 text-3xl rounded-lg">
            <IoDocumentTextOutline />
          </div>
          <div>
            <span className="text-sm">Total Tasks</span>
            <span className="block text-xl font-bold">{totalTasks}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 rounded-lg p-4 border">
          <div className="bg-yellow-100 text-yellow-500 p-2 text-3xl rounded-lg">
            <MdAccessTime />
          </div>
          <div>
            <span className="text-sm">Pending Tasks</span>
            <span className="block text-xl font-bold">{pendingTasks}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 rounded-lg p-4 border">
          <div className="bg-green-100 text-green-500 p-2 text-3xl rounded-lg">
            <SiTicktick />
          </div>
          <div>
            <span className="text-sm">Completed Tasks</span>
            <span className="block text-xl font-bold">{completedTasks}</span>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && <p>Loading tasks...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !userTasks.length && <p>No tasks assigned.</p>}

        {sortedTasks.map((task) => (
          <div
            key={task._id}
            className={`rounded-xl shadow-md p-6 border transition-all duration-300 hover:shadow-lg ${task.urgent
              ? "bg-orange-50 border-orange-400"
              : "bg-white border-gray-200"
              }`}
          >
            {/* Task Details */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-lg text-left font-black text-gray-600">
                  Task Title:{" "}
                  <span className="font-normal">{task.title}</span>
                </p>

                <p className="text-lg text-left font-semibold text-gray-600">
                  Task Type:{" "}
                  <span className="font-normal text-gray-800 ml-1">
                    {task.taskType}
                  </span>
                </p>

                {task.assignedBy && (
                  <p className="text-lg text-left font-semibold text-gray-600">
                    Assigned By:{" "}
                    <span className="font-normal text-gray-800 ml-1">
                      {task.assignedBy.username} ({task.assignedBy.employeeId})
                    </span>
                  </p>
                )}
              </div>

              {/* Status + Urgent */}
              <div className="flex flex-col items-end gap-2">
                <div
                  className={`flex items-center text-xs font-semibold px-3 py-1 rounded-full
                    ${task.userStatus === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-600"
                    }`}
                >
                  <MdAccessTime className="text-base mr-1" />
                  <span className="capitalize">{task.userStatus}</span>
                </div>

                {task.urgent && (
                  <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full text-red-700 bg-red-100">
                    URGENT
                  </span>
                )}
              </div>
            </div>

            {/* Description + PO */}
            <div className="mb-3">
              <p className="text-sm text-left font-semibold text-gray-600 mb-2">
                Description:{" "}
                <span className="font-normal text-gray-700 ml-1">
                  {task.description}
                </span>
              </p>

              {task.poId && (
                <p className="text-sm text-left font-semibold text-gray-600">
                  PO Number:{" "}
                  <span className="font-normal text-gray-700 ml-1">
                    {task.poId.orderNumber || "PO"}
                  </span>
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center mt-4">
              {task.taskDeadline && (
                <p className="text-sm font-semibold text-gray-600">
                  Due:{" "}
                  <span className="font-normal text-gray-700 ml-1">
                    {new Date(task.taskDeadline).toLocaleDateString()}
                  </span>
                </p>
              )}

              <button
                onClick={() =>
                  dispatch(
                    updateUserTaskStatus({
                      taskId: task._id,
                      status: task.userStatus === "completed" ? "pending" : "completed",
                    })
                  )
                }
                className="bg-white border rounded-lg px-3 py-1 text-sm font-semibold hover:bg-blue-500 hover:text-white duration-300"
              >
                {task.userStatus === "completed" ? "Mark Pending" : "Complete"}
              </button>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserTask;
