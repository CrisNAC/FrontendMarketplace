import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockApi } = vi.hoisted(() => {
    const mockApi = {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    }
    return { mockApi }
})

vi.mock('axios', () => ({
    default: {
        create: vi.fn(() => mockApi),
    }
}))

import { useAddresses } from '../hooks/useAddresses'

const mockAddress = {
    id_address: 1,
    address: 'Calle Principal 123',
    city: 'Asunción',
    region: 'Central',
    postal_code: '001',
}

describe('useAddresses', () => {
    beforeEach(() => vi.clearAllMocks())

    it('no hace fetch cuando userId es null', async () => {
        const { result } = renderHook(() => useAddresses(null))

        await waitFor(() => {
            expect(result.current.loading).toBe(false)
        })

        expect(mockApi.get).not.toHaveBeenCalled()
        expect(result.current.addresses).toEqual([])
    })

    it('carga las direcciones cuando userId está disponible', async () => {
        mockApi.get.mockResolvedValueOnce({ data: { data: [mockAddress] } })

        const { result } = renderHook(() => useAddresses(7))

        await waitFor(() => {
            expect(result.current.loading).toBe(false)
        })

        expect(mockApi.get).toHaveBeenCalledWith('/7/addresses')
        expect(result.current.addresses).toHaveLength(1)
        expect(result.current.addresses[0]).toMatchObject({ id_address: 1 })
    })

    it('setea error cuando falla la carga', async () => {
        mockApi.get.mockRejectedValueOnce({
            response: { data: { message: 'No autorizado' } }
        })

        const { result } = renderHook(() => useAddresses(7))

        await waitFor(() => {
            expect(result.current.error).toBe('No autorizado')
        })
    })

    it('usa mensaje por defecto cuando el error no tiene mensaje', async () => {
        mockApi.get.mockRejectedValueOnce(new Error('fail'))

        const { result } = renderHook(() => useAddresses(7))

        await waitFor(() => {
            expect(result.current.error).toBe('Error al obtener direcciones')
        })
    })

    it('createAddress agrega la nueva dirección al estado', async () => {
        mockApi.get.mockResolvedValueOnce({ data: { data: [] } })
        mockApi.post.mockResolvedValueOnce({ data: { data: mockAddress } })

        const { result } = renderHook(() => useAddresses(7))

        await waitFor(() => expect(result.current.loading).toBe(false))

        let created
        await act(async () => {
            created = await result.current.createAddress({ address: 'Calle Principal 123' })
        })

        expect(mockApi.post).toHaveBeenCalledWith('/7/addresses', { address: 'Calle Principal 123' })
        expect(result.current.addresses).toHaveLength(1)
        expect(created).toMatchObject({ id_address: 1 })
    })

    it('createAddress lanza error cuando userId es null', async () => {
        const { result } = renderHook(() => useAddresses(null))

        await expect(result.current.createAddress({})).rejects.toThrow('Usuario no autenticado')
    })

    it('createAddress lanza error del backend cuando falla', async () => {
        mockApi.get.mockResolvedValueOnce({ data: { data: [] } })
        mockApi.post.mockRejectedValueOnce({
            response: { data: { message: 'Dirección inválida' } }
        })

        const { result } = renderHook(() => useAddresses(7))
        await waitFor(() => expect(result.current.loading).toBe(false))

        await expect(result.current.createAddress({})).rejects.toThrow('Dirección inválida')
    })

    it('updateAddress actualiza la dirección en el estado', async () => {
        mockApi.get.mockResolvedValueOnce({ data: { data: [mockAddress] } })
        const updated = { ...mockAddress, city: 'Luque' }
        mockApi.put.mockResolvedValueOnce({ data: { data: updated } })

        const { result } = renderHook(() => useAddresses(7))
        await waitFor(() => expect(result.current.loading).toBe(false))

        await act(async () => {
            await result.current.updateAddress(1, { city: 'Luque' })
        })

        expect(mockApi.put).toHaveBeenCalledWith('/7/addresses/1', { city: 'Luque' })
        expect(result.current.addresses[0].city).toBe('Luque')
    })

    it('updateAddress lanza error cuando userId es null', async () => {
        const { result } = renderHook(() => useAddresses(null))

        await expect(result.current.updateAddress(1, {})).rejects.toThrow('Usuario no autenticado')
    })

    it('deleteAddress elimina la dirección del estado', async () => {
        mockApi.get.mockResolvedValueOnce({ data: { data: [mockAddress] } })
        mockApi.delete.mockResolvedValueOnce({ data: { data: mockAddress } })

        const { result } = renderHook(() => useAddresses(7))
        await waitFor(() => expect(result.current.loading).toBe(false))

        await act(async () => {
            await result.current.deleteAddress(1)
        })

        expect(mockApi.delete).toHaveBeenCalledWith('/7/addresses/1')
        expect(result.current.addresses).toHaveLength(0)
    })

    it('deleteAddress lanza error cuando userId es null', async () => {
        const { result } = renderHook(() => useAddresses(null))

        await expect(result.current.deleteAddress(1)).rejects.toThrow('Usuario no autenticado')
    })

    it('expone refetch para recargar las direcciones', async () => {
        mockApi.get
            .mockResolvedValueOnce({ data: { data: [] } })
            .mockResolvedValueOnce({ data: { data: [mockAddress] } })

        const { result } = renderHook(() => useAddresses(7))
        await waitFor(() => expect(result.current.loading).toBe(false))

        expect(result.current.addresses).toHaveLength(0)

        await act(async () => {
            await result.current.refetch()
        })

        expect(result.current.addresses).toHaveLength(1)
    })
})
