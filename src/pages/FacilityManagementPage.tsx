// src/pages/FacilityManagementPage.tsx

import { useState, useEffect } from 'react';
import { fetchFacilities, deleteFacility, type Facility } from '../features/facilities/facilitySlice';
import FacilityForm from '../features/facilities/FacilityForm';
import { toast } from "sonner";

// Shadcn UI Components & Icons
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Building } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { FacilityDataTable } from '@/features/facilities/FacilityDataTable';

type ModalState = {
    type: 'create' | 'edit' | 'delete' | null;
    data?: Facility;
};

const FacilityManagementPage = () => {
    const dispatch = useAppDispatch();
    const { facilities, status, error, totalCount } = useAppSelector((state) => state.facilities);

    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [modalState, setModalState] = useState<ModalState>({ type: null });

    const totalPages = Math.ceil(totalCount / pagination.pageSize) || 1;

    useEffect(() => {
        // This effect handles all data fetching and re-fetching
        dispatch(fetchFacilities({ page: pagination.pageIndex + 1, limit: pagination.pageSize }));
    }, [dispatch, pagination.pageIndex, pagination.pageSize, status === 'idle']);

    const handleCRUDSuccess = () => {
        setModalState({ type: null });
        // Trigger a refetch of the current page's data
        dispatch(fetchFacilities({ page: pagination.pageIndex + 1, limit: pagination.pageSize }));
    };

    const handleDelete = () => {
        if (modalState.type !== 'delete' || !modalState.data) return;
        const promise = dispatch(deleteFacility(modalState.data.id)).unwrap();
        toast.promise(promise, {
            loading: 'Deleting facility...',
            success: () => {
                // Smartly go to previous page if last item on a page is deleted
                if (facilities.length === 1 && pagination.pageIndex > 0) {
                    setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex - 1}));
                } else {
                    handleCRUDSuccess();
                }
                return 'Facility deleted successfully!';
            },
            error: (err) => err,
        });
    };

    // Render loading state only on initial fetch
    if (status === 'loading' && facilities.length === 0) {
        return <p className="p-6 text-center text-muted-foreground">Loading facilities...</p>;
    }

    // Render full page error state
    if (status === 'failed' && facilities.length === 0) {
        return <p className="p-6 text-center text-destructive">{error}</p>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Facility Management</h1>
                <Button onClick={() => setModalState({ type: 'create' })}>
                    <Building className="mr-2 h-4 w-4" />
                    Add Facility
                </Button>
            </div>

            <FacilityDataTable
                data={facilities}
                pageCount={totalPages}
                pageIndex={pagination.pageIndex}
                pageSize={pagination.pageSize}
                onPageChange={(pageIndex) => setPagination(prev => ({ ...prev, pageIndex }))}
                onPageSizeChange={(pageSize) => setPagination({ pageIndex: 0, pageSize })}
                onEdit={(facility) => setModalState({ type: 'edit', data: facility })}
                onDelete={(facility) => setModalState({ type: 'delete', data: facility })}
            />

            {/* Modals for Create/Edit and Delete */}
            <Dialog open={modalState.type === 'create' || modalState.type === 'edit'} onOpenChange={(isOpen) => !isOpen && setModalState({ type: null })}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{modalState.type === 'edit' ? 'Edit Facility' : 'Create New Facility'}</DialogTitle>
                    </DialogHeader>
                    <FacilityForm
                        onSuccess={handleCRUDSuccess}
                        facilityToEdit={modalState.type === 'edit' ? modalState.data : undefined}
                    />
                </DialogContent>
            </Dialog>

            <AlertDialog open={modalState.type === 'delete'} onOpenChange={(isOpen) => !isOpen && setModalState({ type: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogDescription>
                        This will permanently delete the facility "{modalState.data?.name}". This action cannot be undone.
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default FacilityManagementPage;