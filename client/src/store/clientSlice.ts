import { createAsyncThunk, createEntityAdapter, createSlice, isRejectedWithValue } from "@reduxjs/toolkit";
import { host, port } from "../Default";
import { IClient } from "../../../Interfaces/IClient";
import { RootState } from ".";

const server = `${host}:${port}`

const clientAdapter = createEntityAdapter<IClient, string>({
    selectId: client => client._id!
})

const initialState = clientAdapter.getInitialState({
    status: 'idle' as 'idle' | "loading" | "succeeded" | "failed", // Состояние загрузки
    error: null as string | null, // Сообщение об ошибке
})

const setError = (error: Error | unknown) => {
    const errorMessage = error instanceof Error
        ? error.message
        : typeof error === "string"
            ? error
            : "Неизвестная ошибка"
    return errorMessage
}

export const fetchClient = createAsyncThunk<
    IClient[],            //Возвращаемый тип ( response Client[] )
    void,            //Тип входного параметра ( отсутствует )
    { rejectValue: string }   //Настройка ( тип ошибки )
>(
    'client/fetchClient',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${server}/api/client`)

            if (!response.ok) {
                const errorMessage = `${response.status} ${response.statusText}`;
                throw new Error(errorMessage);
            }
            const data: IClient[] = await response.json()
            return data
        } catch (error) {
            return rejectWithValue(setError(error))
        }
    }
)

export const updateClient = createAsyncThunk<
    IClient,            //Возвращаемый тип ( response Client )
    IClient,            //Тип входного параметра ( newClient )
    { rejectValue: string }   //Настройка ( тип ошибки )
>(
    'client/updateClient',
    async (updateClient, { rejectWithValue }) => {
        try {
            const response = await fetch(`${server}/api/client/${updateClient._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateClient)
            })

            if (!response.ok) {
                const errorMessage = `${response.status} ${response.statusText}`;
                throw new Error(errorMessage);
            }

            const data: IClient = await response.json()
            return data

        } catch (error) {
            return rejectWithValue(setError(error));
        }
    }
)
export const addClient = createAsyncThunk<
    IClient,            //Возвращаемый тип ( response Client )
    IClient,            //Тип входного параметра ( newClient )
    { rejectValue: string }   //Настройка ( тип ошибки )
>(
    'client/addClient',
    async (newClient, { rejectWithValue }) => {
        try {
            const response = await fetch(`${server}/api/client`, {
                method: 'POST',
                body: JSON.stringify(newClient),
                headers: { 'Content-Type': 'application/json' }
            })

            if (!response.ok) {
                const errorMessage = `${response.status} ${response.statusText}`;
                throw new Error(errorMessage);
            }

            const data: IClient = await response.json()
            return data
        } catch (error) {
            return rejectWithValue(setError(error));
        }
    }
)

export const deleteClient = createAsyncThunk<
    string,            //Возвращаемый тип ( clientId )
    string,            //Тип входного параметра ( clientId )
    { rejectValue: string }   //Настройка ( тип ошибки )
>(
    'client/deleteClient',
    async (id, { rejectWithValue }) => {
        try {
            const response = await fetch(`${server}/api/client/${id}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                return id
            }

            const errorData = await response.json()
            const errorMessage = errorData.message || `${response.status} ${response.statusText}`;

            return rejectWithValue(errorMessage);

        } catch (error) {
            return rejectWithValue(setError(error));
        }
    }
)

const clientSlice = createSlice({
    name: 'client',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchClient.fulfilled, (state, action) => {
                state.status = 'succeeded'
                clientAdapter.setAll(state, action.payload)
            })
            .addCase(fetchClient.pending, (state, action) => {
                state.status = 'loading'
                state.error = null
            })
            .addCase(fetchClient.rejected, (state, action) => {
                state.status = 'failed'
                state.error = isRejectedWithValue(action) ?
                    action.payload as string : 'Неизвестная ошибка'
            })
            .addCase(addClient.fulfilled, (state, action) => {
                state.status = 'succeeded',
                    clientAdapter.addOne(state, action.payload)
            })
            .addCase(updateClient.fulfilled, (state, action) => {
                state.status = 'succeeded'
                clientAdapter.updateOne(state, { id: action.payload._id!, changes: action.payload })
            })
            .addCase(updateClient.rejected, (state, action) => {
                state.status = 'failed'
                state.error = isRejectedWithValue(action) ?
                    action.payload as string : 'Неизвестная ошибка'
            })
            .addCase(deleteClient.fulfilled, (state, action) => {
                state.status = 'succeeded'
                clientAdapter.removeOne(state, action.payload)
            })
            .addCase(deleteClient.rejected, (state, action) => {
                state.status = 'failed'
                state.error = isRejectedWithValue(action) ?
                    action.payload as string : 'Неизвестная ошибка'
            })
    }
})

export const {
    selectAll: selectAllClients,
    selectById: selectClientById
} = clientAdapter.getSelectors((state: RootState) => state.client)


export const clientReducer = clientSlice.reducer