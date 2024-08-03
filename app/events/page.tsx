"use client";

import { useRouter } from "next/navigation";
import withAuth from "@/app/components/AuthWrapper";
import { useAuth } from "@/app/components/AuthProvider";
import { Event } from "../../lib/types/event";
import { useState, useEffect } from "react";
import { Badge } from "../components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../components/ui/table";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/app/components/ui/tabs";
import { Button } from "../components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogTrigger,
	DialogFooter,
} from "@/app/components/ui/dialog";

function Events() {
	const [events, setEvents] = useState<Event[]>([]);
	const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
	const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);
	const { isAuthenticated, login, logout } = useAuth();
	const userData = isAuthenticated
		? JSON.parse(localStorage.getItem("userData") || "{}")
		: null;
	const router = useRouter();

	function handleSession(code: string) {
		return router.push(`/events/${code}`);
	}

	useEffect(() => {
		async function fetchEvents() {
			if (!userData?.token) return;

			const response = await fetch("http://localhost:8080/api/v1/events", {
				headers: {
					"X-API-KEY": process.env.NEXT_PUBLIC_API_KEY || "",
					"Content-Type": "application/json",
					Authorization: `Bearer ${userData.token}`,
				},
			});
			const data = await response.json();
			setEvents(data.data);
		}

		fetchEvents();
	}, []);

	// Detect screen size
	useEffect(() => {
		const handleResize = () => {
			setIsSmallScreen(window.innerWidth <= 640); // Adjust the width as needed
		};

		handleResize(); // Initial check
		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	const handleEventClick = (event: Event) => {
		setSelectedEvent(event);
		setIsDialogOpen(true);
	};

	const handleDialogClose = () => {
		setIsDialogOpen(false);
		setSelectedEvent(null);
	};

	return (
		<>
			<div className="flex min-h-screen w-full flex-col">
				<div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
					<main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
						<Tabs defaultValue="all">
							<TabsContent value="all">
								<Card x-chunk="dashboard-06-chunk-0">
									<CardHeader>
										<CardTitle>Events</CardTitle>
										<CardDescription>Grow Community Events</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="overflow-x-auto">
											<Table className="min-w-full">
												<TableHeader>
													<TableRow>
														<TableHead>Name</TableHead>
														<TableHead>Status</TableHead>
														<TableHead className="hidden sm:table-cell">
															Description
														</TableHead>
														<TableHead className="hidden sm:table-cell">
															Registration Time
														</TableHead>
														<TableHead></TableHead>
													</TableRow>
												</TableHeader>
												<TableBody>
													{events.map((event) => (
														<TableRow key={event.id}>
															<TableCell className="font-medium">
																{isSmallScreen ? (
																	<button
																		onClick={() => handleEventClick(event)}
																		className="text-blue-500 underline sm:no-underline"
																	>
																		{event.name}
																	</button>
																) : (
																	event.name
																)}
															</TableCell>
															<TableCell>
																<Badge variant="outline">{event.status}</Badge>
															</TableCell>
															<TableCell className="hidden sm:table-cell">
																{event.description}
															</TableCell>
															<TableCell className="hidden sm:table-cell">
																{new Date(
																	event.openRegistration
																).toLocaleString()}{" "}
																-{" "}
																{new Date(
																	event.closedRegistration
																).toLocaleString()}
															</TableCell>
															<TableCell>
																{event.status === "active" && (
																	<Button
																		onClick={() => handleSession(event.code)}
																	>
																		View
																	</Button>
																)}
															</TableCell>
														</TableRow>
													))}
												</TableBody>
											</Table>
										</div>
										{selectedEvent && (
											<Dialog
												open={isDialogOpen}
												onOpenChange={handleDialogClose}
											>
												<DialogContent className="sm:max-w-[425px] max-w-full py-2 sm:px-4 sm:py-4">
													<DialogHeader>
														<DialogTitle>{selectedEvent.name}</DialogTitle>
														<DialogDescription>
															{selectedEvent.status}
														</DialogDescription>
													</DialogHeader>
													<p>{selectedEvent.description}</p>
													<p>
														Registration Time:{" "}
														{new Date(
															selectedEvent.openRegistration
														).toLocaleString()}{" "}
														-{" "}
														{new Date(
															selectedEvent.closedRegistration
														).toLocaleString()}
													</p>
													<DialogFooter>
														<Button onClick={handleDialogClose}>Close</Button>
													</DialogFooter>
												</DialogContent>
											</Dialog>
										)}
									</CardContent>
								</Card>
							</TabsContent>
						</Tabs>
					</main>
				</div>
			</div>
		</>
	);
}

export default withAuth(Events);
