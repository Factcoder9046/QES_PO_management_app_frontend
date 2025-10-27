/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import api, { getOrderById, getTasksByPO, taskcreate, updateTake, type TaskCratePayload } from "../../utils/api";




interface TaskState {
  tasks: TaskCratePayload[];
  userTasks: TaskCratePayload[];
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  userTasks: [],
  loading: false,
  error: null,
};

interface updateStatus {
  taskId: string,
  status: boolean
}

export const taskCreate = createAsyncThunk(
  "task/taskCreate",
  async (taskData: TaskCratePayload, { rejectWithValue }) => {
    try {
      console.log(taskData, "check on the slice RE")
      const response = await taskcreate(taskData);
      return response.task;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create task");
    }
  }
);

export const fetchTasksByPO = createAsyncThunk(
  "task/fetchTasksByPO",
  async (poId: string, { rejectWithValue }) => {
    try {
      const response = await getOrderById(poId);
      console.log(response, "idid check response")
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch tasks");
    }
  }
);




export const fetchTaskByTaskId = createAsyncThunk(
  "task/fetchTasksByPO",
  async (taskId: string, { rejectWithValue }) => {
    try {
      const response = await getTasksByPO(taskId);
      console.log(response, "skdd")
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch tasks");
    }
  }
);

export const updateTaskStatus = createAsyncThunk(
  "task/updateTaskStatus",
  async ({ taskId, status }: updateStatus, { rejectWithValue }) => {
    console.log(taskId, "task user", status, "check status come or not")
    try {
      const response = await updateTake(taskId, { status });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update task status");
    }
  }
);

export const fetchTasksAssignedToUser = createAsyncThunk(
  "task/fetchTasksAssignedToUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      // correct backend route
      const response = await api.get(`/task/api/user/${userId}`, {
        withCredentials: true,
      });

      console.log("Fetch tasks response:", response.data);


      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch tasks"
      );
    }
  }
);

//  user status update New func Added
export const updateUserTaskStatus = createAsyncThunk(
  "tasks/updateUserTaskStatus",
  async (
    { taskId, status }: { taskId: string; status: "pending" | "completed" },
    
    { rejectWithValue }
  ) => {
    try {
      const res = await api.patch(
        `/task/api/tasks/user-status/${taskId}`,
        
        { status },
        { withCredentials: true }
      );
      return res.data.task;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update user task status"
      );
    }
  }
);



const taskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    resetask: (state) => {
      state.loading = false;
      state.error = null;
    },
    markTaskAsCompleted: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.map((task) =>
        task._id === action.payload
          ? { ...task, status: task.status === "completed" ? "pending" : "completed" }
          : task
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // Task Create
      .addCase(taskCreate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(taskCreate.fulfilled, (state, action: PayloadAction<TaskCratePayload>) => {
        state.loading = false;
        state.tasks = [...state.tasks, action.payload];
      })
      .addCase(taskCreate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Tasks by PO
      .addCase(fetchTasksByPO.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasksByPO.fulfilled, (state, action: PayloadAction<TaskCratePayload[]>) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasksByPO.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Task Status
      .addCase(updateTaskStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
    // .addCase(updateTaskStatus.fulfilled, (state, action: PayloadAction<TaskCratePayload>) => {
    //   state.loading = false;
    //   // tasks array update
    //   state.tasks = state.tasks.map((task) =>
    //     task._id === action.payload._id ? action.payload : task
    //   );


    //   state.userTasks = state.userTasks.map((task) =>
    //     task._id === action.payload._id ? action.payload : task
    //   );

    // })
    builder
      .addCase(updateUserTaskStatus.fulfilled, (state, action) => {
        const index = state.userTasks.findIndex(
          (task) => task._id === action.payload._id
        );
        if (index !== -1) {
          state.userTasks[index] = action.payload;
        }
      })

      .addCase(updateUserTaskStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      //  Fetch Tasks Assigned to User
      .addCase(fetchTasksAssignedToUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasksAssignedToUser.fulfilled, (state, action: PayloadAction<TaskCratePayload[]>) => {
        state.loading = false;
        state.userTasks = Array.isArray(action.payload)
          ? action.payload
          : [action.payload];
        state.error = null;
      })
      .addCase(fetchTasksAssignedToUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetask, markTaskAsCompleted } = taskSlice.actions;
export const selectTasks = (state: RootState) => ({
  tasks: state.task.tasks,
  userTasks: state.task.userTasks,
  loading: state.task.loading,
  error: state.task.error,
});

export default taskSlice.reducer;