/**
 * Welcome to Cloudflare Workers!
 *
 * This is a template for a Scheduled Worker: a Worker that can run on a
 * configurable interval:
 * https://developers.cloudflare.com/workers/platform/triggers/cron-triggers/
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { createClient } from '@supabase/supabase-js';

export default {
	// The scheduled handler is invoked at the interval set in our wrangler.toml's
	// [[triggers]] configuration.
	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
		if(!env.SUPABASE_URL || !env.SUPABASE_KEY || env.SUPABASE_URL === '' || env.SUPABASE_KEY === '') {
			throw new Error('Missing SUPABASE_URL or SUPABASE_KEY');
		}

		const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
		
		const startTime = new Date().toISOString();
		console.log('Starting delete-old-meter-readings-worker at', startTime);

		// Calculate the date three months ago
		const deleteBeforeDate = new Date();
		deleteBeforeDate.setMonth(deleteBeforeDate.getMonth() - 3);

		// Delete old meter readings from the database
		try {
			const { status, error, statusText } = await supabase.from('MeterReadings').delete().lt('createdAt', deleteBeforeDate.toISOString());

			if (status !== 204 || error ) {
				throw new Error(statusText || 'Error deleting old meter readings');
			} 
				
			console.log(`Deleted old meter readings`);
		} catch (err) {
			console.error('Error deleting old meter readings:', err);
		}

		const endTime = new Date().toISOString();
		console.log('Finished delete-old-meter-readings-worker at', endTime);

		const timeTaken = new Date(endTime).getTime() - new Date(startTime).getTime();
		const message = `Finished delete-old-meter-readings-worker in ${timeTaken} ms`;
	},
};
