import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DoctorProvider, useDoctor } from "@/contexts/DoctorContext";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import {
    Input,
} from "@/components/ui/input";
import {
    Button,
} from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { MessageSquare, ArrowUpDown, Calendar, User, Filter, FileX } from "lucide-react";
import { data } from "autoprefixer";

const UserHistory = () => {
    const { user } = useAuth();
    const { doctors, isLoading, error, refetchDoctors } = useDoctor(); 
    const fetchDoctors=refetchDoctors

    const [filters, setFilters] = useState({
        doctorName: "",
        dateFrom: "",
        dateTo: "",
        status: "all",
    });
    const [tempFilters, setTempFilters] = useState(filters);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        if (user?._id) {
            // fetchDoctors(user._id).catch(console.error);
        }
    }, [user, fetchDoctors]);

    const sortData = (data, sortConfig) => {
        if (!sortConfig.key) return data;
        return [...data].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === "asc" ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === "asc" ? 1 : -1;
            }
            return 0;
        });
    };

    console.log(data);
    
    const filterData = (data) => {
        return data.filter((item) => {
            const doctorMatch = item.doctorName && item.doctorName.toLowerCase().includes(filters.doctorName.toLowerCase());
            const statusMatch =
                filters.status === "all" || item.status === filters.status;
            const dateMatch =
                (!filters.dateFrom || item.date >= filters.dateFrom) &&
                (!filters.dateTo || item.date <= filters.dateTo);
            return doctorMatch && statusMatch && dateMatch;
        });
    };
    

    const requestSort = (key) => {
        const direction =
            sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
        setSortConfig({ key, direction });
    };

    const applyFilters = () => {
        setFilters(tempFilters);
        setIsFilterOpen(false);
    };

    const resetFilters = () => {
        const resetState = {
            doctorName: "",
            dateFrom: "",
            dateTo: "",
            status: "all",
        };
        setTempFilters(resetState);
        setFilters(resetState);
        setIsFilterOpen(false);
    };

    const getActiveFiltersCount = () => {
        return Object.values(filters).filter(value => value && value !== "all").length;
    };

    const FilterFields = () => (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Doctor Name</label>
                <Input
                    placeholder="Search by doctor name"
                    value={tempFilters.doctorName}
                    onChange={(e) =>
                        setTempFilters({ ...tempFilters, doctorName: e.target.value })
                    }
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <div className="grid grid-cols-2 gap-2">
                    <Input
                        type="date"
                        value={tempFilters.dateFrom}
                        onChange={(e) =>
                            setTempFilters({ ...tempFilters, dateFrom: e.target.value })
                        }
                    />
                    <Input
                        type="date"
                        value={tempFilters.dateTo}
                        onChange={(e) =>
                            setTempFilters({ ...tempFilters, dateTo: e.target.value })
                        }
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                    value={tempFilters.status}
                    onValueChange={(value) =>
                        setTempFilters({ ...tempFilters, status: value })
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );

    const EmptyState = ({ onReset }) => (
        <Card className="w-full max-w-md mx-auto text-center p-6">
            <div className="flex flex-col items-center space-y-4">
                <FileX className="w-12 h-12 text-gray-400" />
                <h3 className="text-lg font-semibold">No appointments found</h3>
                <p className="text-sm text-gray-500">
                    {getActiveFiltersCount() > 0
                        ? "Try adjusting your filters or clear them to see more results."
                        : "You don't have any appointment history yet."}
                </p>
                {getActiveFiltersCount() > 0 && (
                    <Button onClick={onReset} variant="outline">
                        Clear Filters
                    </Button>
                )}
            </div>
        </Card>
    );

    if (isLoading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-red-600">Error Loading History</h3>
                    <p className="text-gray-600">{error}</p>
                    <Button 
                        onClick={() => fetchDoctors(user._id)} 
                        className="mt-4 bg-primary"
                    >
                        Retry
                    </Button>
                </Card>
            </div>
        );
    }

    const filteredAndSortedData = sortData(filterData(doctors), sortConfig);

    if (!filteredAndSortedData.length) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <EmptyState onReset={resetFilters} />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Appointment History</h2>
                <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            Filters
                            {getActiveFiltersCount() > 0 && (
                                <span className="ml-1 px-2 py-0.5 text-xs bg-primary text-white rounded-full">
                                    {getActiveFiltersCount()}
                                </span>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Filter Appointments</SheetTitle>
                        </SheetHeader>
                        <div className="py-6">
                            <FilterFields />
                        </div>
                        <SheetFooter>
                            <div className="flex space-x-2">
                                <Button variant="outline" onClick={resetFilters}>
                                    Reset
                                </Button>
                                <Button onClick={applyFilters}>Apply Filters</Button>
                            </div>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead onClick={() => requestSort("date")} className="cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Date
                                        <ArrowUpDown className="w-4 h-4" />
                                    </div>
                                </TableHead>
                                <TableHead>Doctor Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAndSortedData.map((doctor) => (
                                <TableRow key={doctor._id}>
                                    <TableCell>{doctor.date}</TableCell>
                                    <TableCell>{doctor.name}</TableCell>
                                    <TableCell>{doctor.status}</TableCell>
                                    <TableCell>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline">View</Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Appointment Details</DialogTitle>
                                                </DialogHeader>
                                                <div className="p-6">
                                                    <p><strong>Doctor Name:</strong> {doctor.name}</p>
                                                    <p><strong>Date:</strong> {doctor.date}</p>
                                                    <p><strong>Status:</strong> {doctor.status}</p>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

const UserHistoryWrapper = () => (
    <DoctorProvider>
        <UserHistory />
    </DoctorProvider>
);

export default UserHistoryWrapper;