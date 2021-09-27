(function($) {

	$(document).ready(function() {

		// Pairing
		$('.btn-pair').click(function(e) {
			e.preventDefault();

			loader(true);
			let tenantId = $(this).attr('data-tenant');
			let landlordId = $(this).attr('data-landlord');
			
			axios.post('/api/pair', {tenantId, landlordId})
				.then(response => {
					console.log(response);
					swal(response.data.message)
				})
				.catch(e => {
					console.log(e);
				})
				.finally(() => {
					loader(false)
				})
		})

		// Logout
		$('.btn-logout').click(function(e) {
			axios.post('/api/logout', {})
				.then(response => {
					location.href = '/';
				})
				.catch(e => {
					swal("Error occur!")
				})
				.finally(() => {
					loader(false)
				})
		});

		// Upgrade Account
		$('.btn-upgrade').click(function(e) {
			
			e.preventDefault();
			loader(true);

			axios.post('/api/upgrade', {})
				.then(response => {
					if(!response.data.error) {
						location.href = '/payment/executive'
					}
					else
						swal(response.data.message)
				})
				.catch(e => {
					swal("Error occur!")
				})
				.finally(() => {
					loader(false)
				})
		});

		$(".btn-delete").click(function(e) {

			e.preventDefault();
			loader(true);

			const data = {
				id: $(this).attr('data-id'),
				type: $(this).attr('data-type')
			}

			axios.post('/api/delete', data)
				.then(response => {
					swal(response.data.message)
					location.reload();
				})
				.catch(e => {
					swal("Error occur!")
				})
				.finally(() => {
					loader(false)
				})
		});

		$(".btn-request").click(function(e) {

			loader(true);

			const data = {
				id: $(this).attr('data-id'),
			}

			axios.post('/api/request-view', data)
				.then(response => {
					swal(response.data.message)
				})
				.catch(e => {
					swal("Request not sent")
				})
				.finally(() => {
					loader(false)
				})
		})

		$(".btn-action").click(function() {

			loader(true);

			const data = {
				id: $(this).attr('data-id'),
				type: $(this).attr('data-type')
			}

			axios.post('/api/user-status', data)
				.then(response => {
					swal(response.data.message)
				})
				.catch(e => {
					swal("Request not sent")
				})
				.finally(() => {
					loader(false)
				})
		})

		$(".btn-survey").click(function() {

			loader(true);

			const ID = $(this).attr('data-id');
			const data = {
				id: $(this).attr('data-id'),
			}

			axios.post('/api/check-survey', data)
				.then(response => {
					if(response.data.status) {
						location.href = '/tenant/survey/' + ID
					}
					else {
						swal(response.data.message)
					}
				})
				.catch(e => {
					swal("Request not sent")
				})
				.finally(() => {
					loader(false)
				})
		})
		
		// Box Toggling
		$("#income").on('change', function(e) {
			const val = $(this).val();
			if(val == 'Yes') {
				$("#incomeBox").css('display', 'block');
			}
			else {
				$("#incomeBox").css('display', 'none');
			}
		})

		$("#preference").on('change', function(e) {
			const val = $(this).val();
			if(val == 'Yes') {
				$("#preferenceBox").css('display', 'block');
			}
			else {
				$("#preferenceBox").css('display', 'none');
			}
		})


		// Utils Ajax
		$("#ajaxForm").submit(function(e) {
			e.preventDefault();

			loader(true);

			const data = $(this).serialize();
			const url = $(this).attr('action');

			const form = $(this);

			axios.post(url, data)
				.then(response => {
					swal(response.data.message)
					if(!response.data.error)
						$(form).trigger('reset');
				})
				.catch(e => {
					swal('Server Error: ' + e.message)
				})
				.finally(() => {
					loader(false)
				})
		})

		$(".signupForm").submit(function(e) {
			e.preventDefault();

			loader(true);

			const data = $(this).serialize();
			const url = $(this).attr('action');

			const form = $(this);

			axios.post(url, data)
				.then(response => {
					swal(response.data.message)
					if(!response.data.error) {
						$(form).trigger('reset');
						if(response.data.redirect) {
							location.href = response.data.redirect
						}
					}
				})
				.catch(e => {
					console.log(e);
					swal('Server Error: ' + e.message)
				})
				.finally(() => {
					loader(false)
				})
		})
	})


	const loader = (state) => {
		if(state) {
			$.LoadingOverlay("show");
		}
		else {
			$.LoadingOverlay("hide");
		}
	}
})(jQuery);